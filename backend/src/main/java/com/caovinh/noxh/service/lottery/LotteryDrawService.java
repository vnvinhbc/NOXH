package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.constant.lottery.LotteryPoolType;
import com.caovinh.noxh.constant.lottery.LotteryResultType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LotteryDrawService {

    private final LotteryHashService lotteryHashService;

    public DrawOutcome draw(List<DrawParticipant> participants, List<DrawApartment> apartments, String finalSeed) {
        String participantHash = lotteryHashService.hashRows("NOXH:v1:PARTICIPANTS", participants.stream()
                .map(DrawParticipant::lotteryCode)
                .sorted()
                .toList());
        String apartmentHash = lotteryHashService.hashRows("NOXH:v1:APARTMENTS", apartments.stream()
                .map(DrawApartment::apartmentCode)
                .sorted()
                .toList());
        List<DrawParticipant> priorityParticipants = participants.stream()
                .filter(participant -> participant.poolType() == LotteryPoolType.PRIORITY)
                .sorted(Comparator.comparing(DrawParticipant::lotteryCode))
                .toList();
        List<NormalCandidate> normalCandidates = participants.stream()
                .filter(participant -> participant.poolType() == LotteryPoolType.NORMAL)
                .map(participant -> new NormalCandidate(
                        participant,
                        lotteryHashService.sha256("NOXH:v1:NORMAL|" + finalSeed + "|" + participant.lotteryCode())))
                .sorted(Comparator.comparing(NormalCandidate::normalRandomValue)
                        .thenComparing(candidate -> candidate.participant().lotteryCode()))
                .toList();

        int remainingUnits = Math.max(apartments.size() - priorityParticipants.size(), 0);
        List<DrawParticipant> selectedNormalParticipants = normalCandidates.stream()
                .limit(remainingUnits)
                .map(NormalCandidate::participant)
                .toList();

        Map<String, NormalCandidate> normalByCode = normalCandidates.stream()
                .collect(Collectors.toMap(candidate -> candidate.participant().lotteryCode(), Function.identity()));

        List<DrawParticipant> winners = new ArrayList<>();
        winners.addAll(priorityParticipants);
        winners.addAll(selectedNormalParticipants);

        String apartmentSeed = lotteryHashService.sha256("NOXH:v1:APARTMENT|" + finalSeed);
        List<WinnerRank> rankedWinners = winners.stream()
                .map(participant -> new WinnerRank(
                        participant,
                        lotteryHashService.sha256("NOXH:v1:WINNER|" + apartmentSeed + "|" + participant.lotteryCode())))
                .sorted(Comparator.comparing(WinnerRank::winnerUnitHash)
                        .thenComparing(rank -> rank.participant().lotteryCode()))
                .toList();
        List<ApartmentRank> rankedApartments = apartments.stream()
                .map(apartment -> new ApartmentRank(
                        apartment,
                        lotteryHashService.sha256("NOXH:v1:UNIT|" + apartmentSeed + "|" + apartment.apartmentCode())))
                .sorted(Comparator.comparing(ApartmentRank::unitRandomValue)
                        .thenComparing(rank -> rank.apartment().apartmentCode()))
                .toList();

        Map<String, Assignment> assignmentByLotteryCode = buildAssignments(rankedWinners, rankedApartments);
        List<DrawResult> results = participants.stream()
                .sorted(Comparator.comparing(DrawParticipant::lotteryCode))
                .map(participant -> toResult(participant, normalByCode.get(participant.lotteryCode()), assignmentByLotteryCode))
                .toList();

        List<String> normalRows = normalCandidates.stream()
                .map(candidate -> candidate.participant().lotteryCode()
                        + "|" + candidate.normalRandomValue()
                        + "|" + (selectedNormalParticipants.contains(candidate.participant())
                        ? LotteryResultType.SELECTED : LotteryResultType.NOT_SELECTED))
                .toList();
        List<String> winnerRows = rankedWinners.stream()
                .map(rank -> rank.participant().lotteryCode() + "|" + rank.winnerUnitHash())
                .toList();
        List<String> apartmentRows = rankedApartments.stream()
                .map(rank -> rank.apartment().apartmentCode() + "|" + rank.unitRandomValue())
                .toList();
        List<String> assignmentRows = assignmentByLotteryCode.values().stream()
                .sorted(Comparator.comparingInt(Assignment::drawOrder))
                .map(assignment -> assignment.drawOrder()
                        + "|" + assignment.participant().participantId()
                        + "|" + assignment.participant().lotteryCode()
                        + "|" + assignment.apartment().apartmentId()
                        + "|" + assignment.apartment().apartmentCode())
                .toList();

        String sortedNormalHash = lotteryHashService.hashRows("NOXH:v1:SORTED_NORMAL", normalRows);
        String sortedWinnerHash = lotteryHashService.hashRows("NOXH:v1:SORTED_WINNER", winnerRows);
        String sortedApartmentHash = lotteryHashService.hashRows("NOXH:v1:SORTED_APARTMENT", apartmentRows);
        String assignmentListHash = lotteryHashService.hashRows("NOXH:v1:ASSIGNMENTS", assignmentRows);
        String resultHash = lotteryHashService.sha256("NOXH:v1:RESULT|"
                + participantHash + "|"
                + apartmentHash + "|"
                + finalSeed + "|"
                + sortedNormalHash + "|"
                + sortedWinnerHash + "|"
                + sortedApartmentHash + "|"
                + assignmentListHash);

        return new DrawOutcome(results, sortedNormalHash, sortedWinnerHash, sortedApartmentHash, assignmentListHash, resultHash);
    }

    private Map<String, Assignment> buildAssignments(List<WinnerRank> rankedWinners, List<ApartmentRank> rankedApartments) {
        List<Assignment> assignments = new ArrayList<>();
        for (int index = 0; index < rankedWinners.size(); index++) {
            WinnerRank winnerRank = rankedWinners.get(index);
            ApartmentRank apartmentRank = rankedApartments.get(index);
            assignments.add(new Assignment(
                    winnerRank.participant(),
                    apartmentRank.apartment(),
                    winnerRank.winnerUnitHash(),
                    apartmentRank.unitRandomValue(),
                    index + 1));
        }
        return assignments.stream()
                .collect(Collectors.toMap(assignment -> assignment.participant().lotteryCode(), Function.identity()));
    }

    private DrawResult toResult(
            DrawParticipant participant,
            NormalCandidate normalCandidate,
            Map<String, Assignment> assignmentByLotteryCode
    ) {
        Assignment assignment = assignmentByLotteryCode.get(participant.lotteryCode());
        LotteryResultType resultType = determineResultType(participant, assignment);
        return new DrawResult(
                participant.participantId(),
                participant.lotteryCode(),
                participant.poolType(),
                resultType,
                normalCandidate == null ? null : normalCandidate.normalRandomValue(),
                assignment == null ? null : assignment.winnerUnitHash(),
                assignment == null ? null : assignment.apartment().apartmentId(),
                assignment == null ? null : assignment.apartment().apartmentCode(),
                assignment == null ? null : assignment.unitRandomValue(),
                assignment == null ? null : assignment.drawOrder()
        );
    }

    private LotteryResultType determineResultType(DrawParticipant participant, Assignment assignment) {
        if (participant.poolType() == LotteryPoolType.PRIORITY) {
            return LotteryResultType.GUARANTEED;
        }
        return assignment == null ? LotteryResultType.NOT_SELECTED : LotteryResultType.SELECTED;
    }

    public record DrawParticipant(String participantId, String lotteryCode, LotteryPoolType poolType) {
    }

    public record DrawApartment(String apartmentId, String apartmentCode) {
    }

    public record DrawResult(
            String participantId,
            String lotteryCode,
            LotteryPoolType poolType,
            LotteryResultType resultType,
            String normalRandomValue,
            String winnerUnitHash,
            String apartmentId,
            String apartmentCode,
            String unitRandomValue,
            Integer drawOrder
    ) {
    }

    public record DrawOutcome(
            List<DrawResult> results,
            String sortedNormalHash,
            String sortedWinnerHash,
            String sortedApartmentHash,
            String assignmentListHash,
            String resultHash
    ) {
    }

    private record NormalCandidate(DrawParticipant participant, String normalRandomValue) {
    }

    private record WinnerRank(DrawParticipant participant, String winnerUnitHash) {
    }

    private record ApartmentRank(DrawApartment apartment, String unitRandomValue) {
    }

    private record Assignment(
            DrawParticipant participant,
            DrawApartment apartment,
            String winnerUnitHash,
            String unitRandomValue,
            int drawOrder
    ) {
    }
}
