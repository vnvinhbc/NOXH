package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.dto.response.lottery.UserLotterySummaryResponse;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.LotteryEvent;
import com.caovinh.noxh.entity.LotteryParticipant;
import com.caovinh.noxh.entity.LotteryResult;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.LotteryParticipantRepository;
import com.caovinh.noxh.repository.LotteryResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserLotterySummaryService {

    ApplicationRepository applicationRepository;
    LotteryParticipantRepository lotteryParticipantRepository;
    LotteryResultRepository lotteryResultRepository;

    @Transactional(readOnly = true)
    public UserLotterySummaryResponse getMySummary() {
        UUID userId = getCurrentUserId();
        List<Application> applications = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (applications.isEmpty()) {
            return UserLotterySummaryResponse.builder().build();
        }

        Application application = applications.get(0);
        Optional<LotteryParticipant> participantOptional =
                lotteryParticipantRepository.findTopByApplicationIdOrderByCreatedAtDesc(application.getId());

        if (participantOptional.isEmpty()) {
            return baseApplicationResponse(application).build();
        }

        LotteryParticipant participant = participantOptional.get();
        LotteryEvent event = participant.getEvent();
        Optional<LotteryResult> resultOptional = lotteryResultRepository.findByParticipantId(participant.getId());
        UserLotterySummaryResponse.UserLotterySummaryResponseBuilder builder = baseApplicationResponse(application)
                .eventId(event.getId().toString())
                .eventName(event.getName())
                .eventStatus(event.getStatus().name())
                .algorithmType(event.getAlgorithmType())
                .lotteryCode(participant.getLotteryCode())
                .poolType(participant.getPoolType().name())
                .priorityTags(participant.getPriorityTags())
                .participantHash(event.getParticipantHash())
                .apartmentHash(event.getApartmentHash())
                .finalSeed(event.getFinalSeed())
                .resultHash(event.getResultHash())
                .lockedAt(event.getLockedAt())
                .startedAt(event.getStartedAt())
                .completedAt(event.getCompletedAt())
                .createdAt(event.getCreatedAt());

        resultOptional.ifPresent(result -> builder
                .resultType(result.getResultType().name())
                .apartmentCode(result.getApartmentCode())
                .drawOrder(result.getDrawOrder())
                .normalRandomValue(result.getNormalRandomValue())
                .winnerUnitHash(result.getWinnerUnitHash())
                .unitRandomValue(result.getUnitRandomValue()));

        return builder.build();
    }

    private UserLotterySummaryResponse.UserLotterySummaryResponseBuilder baseApplicationResponse(Application application) {
        return UserLotterySummaryResponse.builder()
                .applicationId(application.getId().toString())
                .applicationCode("HA-" + application.getId().toString().substring(0, 8).toUpperCase())
                .applicationStatus(application.getStatus().name())
                .priorityScore(application.getPriorityScore())
                .priorityCategory(application.getPriorityCategory())
                .projectId(application.getProject().getId().toString())
                .projectName(application.getProject().getName());
    }

    private UUID getCurrentUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}
