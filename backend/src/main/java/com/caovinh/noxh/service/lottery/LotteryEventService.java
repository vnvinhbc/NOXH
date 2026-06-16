package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.constant.lottery.*;
import com.caovinh.noxh.dto.request.lottery.CreateLotteryEventRequest;
import com.caovinh.noxh.dto.request.lottery.StartLotteryRequest;
import com.caovinh.noxh.dto.response.lottery.*;
import com.caovinh.noxh.entity.*;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.*;
import com.caovinh.noxh.service.PriorityScoringService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LotteryEventService {

    LotteryEventRepository lotteryEventRepository;
    ProjectRepository projectRepository;
    ApplicationRepository applicationRepository;
    ApartmentUnitRepository apartmentUnitRepository;
    ApplicationPriorityTagRepository applicationPriorityTagRepository;
    LotteryParticipantRepository lotteryParticipantRepository;
    LotteryJobRepository lotteryJobRepository;
    LotteryResultRepository lotteryResultRepository;
    LotteryHashService lotteryHashService;
    LotteryDrawService lotteryDrawService;
    LotteryAuditService lotteryAuditService;
    LotteryRealtimeService lotteryRealtimeService;
    PriorityScoringService priorityScoringService;
    SecureRandom secureRandom = new SecureRandom();

    @Transactional(readOnly = true)
    public List<LotteryEventResponse> getEvents() {
        return lotteryEventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toEventResponse)
                .toList();
    }

    @Transactional
    public LotteryEventResponse createEvent(CreateLotteryEventRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        String privateSalt = generatePrivateSalt();
        LotteryEvent event = LotteryEvent.builder()
                .project(project)
                .name(request.getName().trim())
                .status(LotteryEventStatus.SEED_COMMITTED)
                .privateSalt(privateSalt)
                .commitmentHash(lotteryHashService.sha256("NOXH:v1:COMMITMENT|" + privateSalt))
                .build();
        LotteryEvent saved = lotteryEventRepository.save(event);
        lotteryAuditService.log(saved, LotteryAuditEventType.LOTTERY_CREATED, "projectId=" + project.getId());
        lotteryAuditService.log(saved, LotteryAuditEventType.SEED_COMMITTED, "commitmentHash=" + saved.getCommitmentHash());
        return toEventResponse(saved);
    }

    @Transactional
    public LotteryEventResponse lockEvent(UUID eventId) {
        LotteryEvent event = findEventForUpdate(eventId);
        if (event.getStatus() != LotteryEventStatus.SEED_COMMITTED) {
            throw new AppException(ErrorCode.LOTTERY_EVENT_INVALID_STATUS);
        }

        List<Application> applications = applicationRepository.findByProjectIdAndStatusOrderByCreatedAtAsc(
                event.getProject().getId(), ApplicationStatus.APPROVED);
        if (applications.isEmpty()) {
            throw new AppException(ErrorCode.LOTTERY_PARTICIPANTS_EMPTY);
        }
        applications.forEach(application -> application.setPriorityScore(priorityScoringService.calculateScore(application)));
        applicationRepository.saveAll(applications);

        List<ApartmentUnit> apartments = apartmentUnitRepository.findByProjectIdAndStatusOrderByApartmentCodeAsc(
                event.getProject().getId(), ApartmentUnitStatus.AVAILABLE);
        if (apartments.isEmpty()) {
            throw new AppException(ErrorCode.LOTTERY_APARTMENTS_EMPTY);
        }

        long priorityPoolSize = applications.stream().filter(this::isPriorityApplication).count();
        if (apartments.size() < priorityPoolSize) {
            throw new AppException(ErrorCode.LOTTERY_APARTMENTS_NOT_ENOUGH_FOR_PRIORITY);
        }

        List<LotteryParticipant> participants = applications.stream()
                .map(application -> buildParticipant(event, application))
                .toList();
        lotteryParticipantRepository.saveAll(participants);

        apartments.forEach(apartment -> {
            apartment.setStatus(ApartmentUnitStatus.LOCKED);
            apartment.setLockedEvent(event);
        });
        apartmentUnitRepository.saveAll(apartments);

        event.setParticipantHash(lotteryHashService.hashRows("NOXH:v1:PARTICIPANTS", participants.stream()
                .map(LotteryParticipant::getLotteryCode)
                .sorted()
                .toList()));
        event.setApartmentHash(lotteryHashService.hashRows("NOXH:v1:APARTMENTS", apartments.stream()
                .map(ApartmentUnit::getApartmentCode)
                .sorted()
                .toList()));
        event.setStatus(LotteryEventStatus.LOCKED);
        event.setLockedAt(LocalDateTime.now(ZoneOffset.UTC));
        LotteryEvent saved = lotteryEventRepository.save(event);

        lotteryAuditService.log(saved, LotteryAuditEventType.PARTICIPANTS_LOCKED,
                "count=" + participants.size() + ",hash=" + saved.getParticipantHash());
        lotteryAuditService.log(saved, LotteryAuditEventType.APARTMENTS_LOCKED,
                "count=" + apartments.size() + ",hash=" + saved.getApartmentHash());
        return toEventResponse(saved);
    }

    @Transactional
    public LotteryEventResponse startEvent(UUID eventId, StartLotteryRequest request) {
        LotteryEvent event = findEventForUpdate(eventId);
        if (event.getStatus() != LotteryEventStatus.LOCKED) {
            throw new AppException(ErrorCode.LOTTERY_EVENT_INVALID_STATUS);
        }
        if (lotteryJobRepository.existsByLotteryEventId(eventId)) {
            throw new AppException(ErrorCode.LOTTERY_JOB_ALREADY_EXISTS);
        }
        if (lotteryResultRepository.existsByEventId(eventId)) {
            throw new AppException(ErrorCode.LOTTERY_RESULT_ALREADY_EXISTS);
        }

        LotteryJob job = lotteryJobRepository.save(LotteryJob.builder()
                .lotteryEvent(event)
                .status(LotteryJobStatus.RUNNING)
                .startedAt(LocalDateTime.now(ZoneOffset.UTC))
                .build());

        try {
            event.setStatus(LotteryEventStatus.DRAWING);
            event.setStartedAt(LocalDateTime.now(ZoneOffset.UTC));
            lotteryRealtimeService.publish(event.getId(), "LOTTERY_STARTED", Map.of("eventId", event.getId().toString()));
            lotteryAuditService.log(event, LotteryAuditEventType.DRAW_STARTED, "jobId=" + job.getId());

            applyManualSeed(event, request);
            lotteryAuditService.log(event, LotteryAuditEventType.SEED_REVEALED, "finalSeed=" + event.getFinalSeed());

            List<LotteryParticipant> participants = lotteryParticipantRepository.findByEventIdOrderByLotteryCodeAsc(eventId);
            List<ApartmentUnit> apartments = apartmentUnitRepository.findByLockedEventIdOrderByApartmentCodeAsc(eventId);
            LotteryDrawService.DrawOutcome outcome = lotteryDrawService.draw(
                    participants.stream()
                            .map(participant -> new LotteryDrawService.DrawParticipant(
                                    participant.getId().toString(),
                                    participant.getLotteryCode(),
                                    participant.getPoolType()))
                            .toList(),
                    apartments.stream()
                            .map(apartment -> new LotteryDrawService.DrawApartment(
                                    apartment.getId().toString(),
                                    apartment.getApartmentCode()))
                            .toList(),
                    event.getFinalSeed()
            );

            persistResults(event, participants, apartments, outcome);
            event.setSortedNormalHash(outcome.sortedNormalHash());
            event.setSortedWinnerHash(outcome.sortedWinnerHash());
            event.setSortedApartmentHash(outcome.sortedApartmentHash());
            event.setAssignmentListHash(outcome.assignmentListHash());
            event.setResultHash(outcome.resultHash());
            event.setStatus(LotteryEventStatus.COMPLETED);
            event.setCompletedAt(LocalDateTime.now(ZoneOffset.UTC));
            job.setStatus(LotteryJobStatus.COMPLETED);
            job.setCompletedAt(LocalDateTime.now(ZoneOffset.UTC));

            lotteryAuditService.log(event, LotteryAuditEventType.NORMAL_POOL_DRAWN, "hash=" + outcome.sortedNormalHash());
            lotteryAuditService.log(event, LotteryAuditEventType.APARTMENTS_ASSIGNED, "hash=" + outcome.sortedApartmentHash());
            lotteryAuditService.log(event, LotteryAuditEventType.RESULT_HASH_CREATED, "resultHash=" + outcome.resultHash());
            lotteryAuditService.log(event, LotteryAuditEventType.RESULT_PUBLISHED, "eventId=" + event.getId());
            lotteryRealtimeService.publish(event.getId(), "LOTTERY_COMPLETED", Map.of("resultHash", outcome.resultHash()));
            lotteryJobRepository.save(job);
            return toEventResponse(lotteryEventRepository.save(event));
        } catch (RuntimeException exception) {
            event.setStatus(LotteryEventStatus.FAILED);
            event.setFailedReason(exception.getMessage());
            job.setStatus(LotteryJobStatus.FAILED);
            job.setErrorMessage(exception.getMessage());
            job.setCompletedAt(LocalDateTime.now(ZoneOffset.UTC));
            lotteryJobRepository.save(job);
            lotteryEventRepository.save(event);
            lotteryAuditService.log(event, LotteryAuditEventType.LOTTERY_FAILED, exception.getMessage());
            lotteryRealtimeService.publish(event.getId(), "LOTTERY_FAILED", Map.of("message", exception.getMessage()));
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public LotteryVerificationResponse getVerification(UUID eventId) {
        LotteryEvent event = findEvent(eventId);
        return LotteryVerificationResponse.builder()
                .eventId(event.getId().toString())
                .projectName(event.getProject().getName())
                .algorithmType(event.getAlgorithmType())
                .participantHash(event.getParticipantHash())
                .apartmentHash(event.getApartmentHash())
                .commitmentHash(event.getCommitmentHash())
                .privateSalt(event.getPrivateSalt())
                .xsmbDrawDate(event.getXsmbDrawDate())
                .xsmbResult(event.getXsmbResult())
                .ethChainId(event.getEthChainId())
                .ethBlockNumber(event.getEthBlockNumber())
                .ethBlockHash(event.getEthBlockHash())
                .clickedTimestamp(event.getClickedTimestamp())
                .finalSeed(event.getFinalSeed())
                .sortedNormalHash(event.getSortedNormalHash())
                .sortedWinnerHash(event.getSortedWinnerHash())
                .sortedApartmentHash(event.getSortedApartmentHash())
                .assignmentListHash(event.getAssignmentListHash())
                .resultHash(event.getResultHash())
                .participants(getParticipants(eventId))
                .apartments(getApartments(eventId))
                .results(getResults(eventId))
                .build();
    }

    @Transactional(readOnly = true)
    public List<LotteryParticipantResponse> getParticipants(UUID eventId) {
        return lotteryParticipantRepository.findByEventIdOrderByLotteryCodeAsc(eventId).stream()
                .map(this::toParticipantResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApartmentUnitResponse> getApartments(UUID eventId) {
        return apartmentUnitRepository.findByLockedEventIdOrderByApartmentCodeAsc(eventId).stream()
                .map(this::toApartmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LotteryResultResponse> getResults(UUID eventId) {
        return lotteryResultRepository.findByEventIdOrderByLotteryCodeAsc(eventId).stream()
                .map(this::toResultResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApartmentUnitResponse> getAvailableApartments(UUID projectId) {
        return apartmentUnitRepository.findByProjectIdAndStatusOrderByApartmentCodeAsc(projectId, ApartmentUnitStatus.AVAILABLE)
                .stream()
                .map(this::toApartmentResponse)
                .toList();
    }

    private LotteryEvent findEventForUpdate(UUID eventId) {
        return lotteryEventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.LOTTERY_EVENT_NOT_FOUND));
    }

    private LotteryEvent findEvent(UUID eventId) {
        return lotteryEventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.LOTTERY_EVENT_NOT_FOUND));
    }

    private String generatePrivateSalt() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private LotteryParticipant buildParticipant(LotteryEvent event, Application application) {
        String priorityTags = resolvePriorityTags(application);
        LotteryPoolType poolType = application.getPriorityScore() != null && application.getPriorityScore() > 0
                ? LotteryPoolType.PRIORITY
                : LotteryPoolType.NORMAL;
        String lotteryCode = "HA-" + application.getId().toString().substring(0, 8).toUpperCase();
        application.setLotteryNumber(lotteryCode);
        return LotteryParticipant.builder()
                .event(event)
                .application(application)
                .lotteryCode(lotteryCode)
                .poolType(poolType)
                .priorityTags(poolType == LotteryPoolType.PRIORITY && !priorityTags.isBlank() ? priorityTags : null)
                .build();
    }

    private boolean isPriorityApplication(Application application) {
        return application.getPriorityScore() != null && application.getPriorityScore() > 0;
    }

    private String resolvePriorityTags(Application application) {
        List<String> tagCodes = applicationPriorityTagRepository.findByApplicationId(application.getId()).stream()
                .map(applicationPriorityTag -> applicationPriorityTag.getPriorityTag().getCode())
                .sorted()
                .toList();
        if (!tagCodes.isEmpty()) {
            return String.join(",", tagCodes);
        }
        String legacyPriority = application.getPriorityCategory();
        return legacyPriority == null || legacyPriority.isBlank() ? "" : legacyPriority.trim();
    }

    private void applyManualSeed(LotteryEvent event, StartLotteryRequest request) {
        LocalDateTime clickedTimestamp = LocalDateTime.now(ZoneOffset.UTC);
        String xsmbResult = request.getXsmbResult().trim();
        String ethBlockHash = request.getEthBlockHash().trim().toLowerCase();
        event.setClickedTimestamp(clickedTimestamp);
        event.setXsmbDrawDate(request.getXsmbDrawDate());
        event.setXsmbResult(xsmbResult);
        event.setEthChainId(request.getEthChainId());
        event.setEthBlockNumber(request.getEthBlockNumber());
        event.setEthBlockHash(ethBlockHash);
        event.setSeedSourceNote(request.getSourceNote() == null ? null : request.getSourceNote().trim());
        event.setFinalSeed(lotteryHashService.sha256("NOXH:v1:FINAL_SEED|"
                + event.getPrivateSalt() + "|"
                + event.getXsmbDrawDate() + "|"
                + xsmbResult + "|"
                + request.getEthChainId() + "|"
                + request.getEthBlockNumber() + "|"
                + ethBlockHash + "|"
                + clickedTimestamp));
    }

    private void persistResults(
            LotteryEvent event,
            List<LotteryParticipant> participants,
            List<ApartmentUnit> apartments,
            LotteryDrawService.DrawOutcome outcome
    ) {
        Map<String, LotteryParticipant> participantById = participants.stream()
                .collect(Collectors.toMap(participant -> participant.getId().toString(), Function.identity()));
        Map<String, ApartmentUnit> apartmentById = apartments.stream()
                .collect(Collectors.toMap(apartment -> apartment.getId().toString(), Function.identity()));

        List<LotteryResult> results = outcome.results().stream()
                .map(result -> {
                    LotteryParticipant participant = participantById.get(result.participantId());
                    ApartmentUnit apartment = result.apartmentId() == null ? null : apartmentById.get(result.apartmentId());
                    participant.getApplication().setLotteryResult(result.resultType().name());
                    if (result.resultType() != LotteryResultType.NOT_SELECTED) {
                        participant.getApplication().setStatus(ApplicationStatus.LOTTERY_QUALIFIED);
                    }
                    return LotteryResult.builder()
                            .event(event)
                            .participant(participant)
                            .lotteryCode(result.lotteryCode())
                            .poolType(result.poolType())
                            .resultType(result.resultType())
                            .normalRandomValue(result.normalRandomValue())
                            .winnerUnitHash(result.winnerUnitHash())
                            .apartment(apartment)
                            .apartmentCode(result.apartmentCode())
                            .unitRandomValue(result.unitRandomValue())
                            .drawOrder(result.drawOrder())
                            .build();
                })
                .toList();
        List<LotteryResult> savedResults = lotteryResultRepository.saveAll(results);
        Map<String, LotteryResult> savedResultByApartmentCode = savedResults.stream()
                .filter(result -> result.getApartmentCode() != null)
                .collect(Collectors.toMap(LotteryResult::getApartmentCode, Function.identity()));
        apartments.forEach(apartment -> {
            LotteryResult result = savedResultByApartmentCode.get(apartment.getApartmentCode());
            if (result != null) {
                apartment.setStatus(ApartmentUnitStatus.ASSIGNED);
                apartment.setAssignedResult(result);
            }
        });
        apartmentUnitRepository.saveAll(apartments);
    }

    private LotteryEventResponse toEventResponse(LotteryEvent event) {
        UUID eventId = event.getId();
        long participantCount = eventId == null ? 0 : lotteryParticipantRepository.findByEventIdOrderByLotteryCodeAsc(eventId).size();
        long apartmentCount = eventId == null ? 0 : apartmentUnitRepository.findByLockedEventIdOrderByApartmentCodeAsc(eventId).size();
        long resultCount = eventId == null ? 0 : lotteryResultRepository.findByEventIdOrderByLotteryCodeAsc(eventId).size();
        return LotteryEventResponse.builder()
                .id(event.getId().toString())
                .projectId(event.getProject().getId().toString())
                .projectName(event.getProject().getName())
                .name(event.getName())
                .status(event.getStatus().name())
                .algorithmType(event.getAlgorithmType())
                .commitmentHash(event.getCommitmentHash())
                .participantHash(event.getParticipantHash())
                .apartmentHash(event.getApartmentHash())
                .xsmbDrawDate(event.getXsmbDrawDate())
                .xsmbResult(event.getXsmbResult())
                .ethChainId(event.getEthChainId())
                .ethBlockNumber(event.getEthBlockNumber())
                .ethBlockHash(event.getEthBlockHash())
                .seedSourceNote(event.getSeedSourceNote())
                .clickedTimestamp(event.getClickedTimestamp())
                .finalSeed(event.getFinalSeed())
                .sortedNormalHash(event.getSortedNormalHash())
                .sortedWinnerHash(event.getSortedWinnerHash())
                .sortedApartmentHash(event.getSortedApartmentHash())
                .assignmentListHash(event.getAssignmentListHash())
                .resultHash(event.getResultHash())
                .failedReason(event.getFailedReason())
                .lockedAt(event.getLockedAt())
                .startedAt(event.getStartedAt())
                .completedAt(event.getCompletedAt())
                .createdAt(event.getCreatedAt())
                .participantCount(participantCount)
                .apartmentCount(apartmentCount)
                .resultCount(resultCount)
                .build();
    }

    private LotteryParticipantResponse toParticipantResponse(LotteryParticipant participant) {
        return LotteryParticipantResponse.builder()
                .id(participant.getId().toString())
                .applicationId(participant.getApplication().getId().toString())
                .lotteryCode(participant.getLotteryCode())
                .poolType(participant.getPoolType().name())
                .priorityTags(participant.getPriorityTags())
                .build();
    }

    private ApartmentUnitResponse toApartmentResponse(ApartmentUnit apartment) {
        return ApartmentUnitResponse.builder()
                .id(apartment.getId().toString())
                .apartmentCode(apartment.getApartmentCode())
                .building(apartment.getBuilding())
                .blockName(apartment.getBlockName())
                .floor(apartment.getFloor())
                .unitNumber(apartment.getUnitNumber())
                .areaSqm(apartment.getAreaSqm())
                .bedroomCount(apartment.getBedroomCount())
                .direction(apartment.getDirection())
                .pricePerSqm(apartment.getPricePerSqm())
                .totalPrice(apartment.getTotalPrice())
                .status(apartment.getStatus().name())
                .build();
    }

    private LotteryResultResponse toResultResponse(LotteryResult result) {
        return LotteryResultResponse.builder()
                .eventId(result.getEvent().getId().toString())
                .participantId(result.getParticipant().getId().toString())
                .lotteryCode(result.getLotteryCode())
                .poolType(result.getPoolType().name())
                .resultType(result.getResultType().name())
                .normalRandomValue(result.getNormalRandomValue())
                .winnerUnitHash(result.getWinnerUnitHash())
                .apartmentId(result.getApartment() == null ? null : result.getApartment().getId().toString())
                .apartmentCode(result.getApartmentCode())
                .unitRandomValue(result.getUnitRandomValue())
                .drawOrder(result.getDrawOrder())
                .createdAt(result.getCreatedAt())
                .build();
    }
}
