package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.constant.lottery.LotteryPoolType;
import com.caovinh.noxh.constant.lottery.LotteryResultType;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LotteryDrawServiceTest {

    LotteryDrawService lotteryDrawService = new LotteryDrawService(new LotteryHashService());

    @Test
    void drawsNormalPoolAndAssignsApartmentsDeterministically() {
        List<LotteryDrawService.DrawParticipant> participants = List.of(
                new LotteryDrawService.DrawParticipant("app-1", "HA-0001", LotteryPoolType.PRIORITY),
                new LotteryDrawService.DrawParticipant("app-2", "HA-0002", LotteryPoolType.NORMAL),
                new LotteryDrawService.DrawParticipant("app-3", "HA-0003", LotteryPoolType.NORMAL),
                new LotteryDrawService.DrawParticipant("app-4", "HA-0004", LotteryPoolType.NORMAL)
        );
        List<LotteryDrawService.DrawApartment> apartments = List.of(
                new LotteryDrawService.DrawApartment("apt-1", "GS-B-0101"),
                new LotteryDrawService.DrawApartment("apt-2", "GS-B-0102"),
                new LotteryDrawService.DrawApartment("apt-3", "GS-B-0201")
        );

        LotteryDrawService.DrawOutcome outcome = lotteryDrawService.draw(participants, apartments, "final-seed");
        LotteryDrawService.DrawOutcome repeated = lotteryDrawService.draw(participants, apartments, "final-seed");

        assertThat(outcome.resultHash()).isEqualTo(repeated.resultHash());
        assertThat(outcome.results()).hasSize(4);
        assertThat(outcome.results())
                .filteredOn(result -> result.poolType() == LotteryPoolType.PRIORITY)
                .singleElement()
                .satisfies(result -> {
                    assertThat(result.resultType()).isEqualTo(LotteryResultType.GUARANTEED);
                    assertThat(result.apartmentCode()).isNotBlank();
                    assertThat(result.drawOrder()).isPositive();
                });

        List<String> expectedSelectedNormalCodes = participants.stream()
                .filter(participant -> participant.poolType() == LotteryPoolType.NORMAL)
                .map(participant -> new NormalRank(
                        participant.lotteryCode(),
                        sha256("NOXH:v1:NORMAL|final-seed|" + participant.lotteryCode())))
                .sorted((left, right) -> {
                    int byHash = left.hash().compareTo(right.hash());
                    return byHash != 0 ? byHash : left.lotteryCode().compareTo(right.lotteryCode());
                })
                .limit(2)
                .map(NormalRank::lotteryCode)
                .toList();

        assertThat(outcome.results())
                .filteredOn(result -> result.poolType() == LotteryPoolType.NORMAL)
                .filteredOn(result -> result.resultType() == LotteryResultType.SELECTED)
                .extracting(LotteryDrawService.DrawResult::lotteryCode)
                .containsExactlyInAnyOrderElementsOf(expectedSelectedNormalCodes);

        assertThat(outcome.results())
                .filteredOn(result -> result.resultType() == LotteryResultType.NOT_SELECTED)
                .singleElement()
                .satisfies(result -> {
                    assertThat(result.apartmentCode()).isNull();
                    assertThat(result.winnerUnitHash()).isNull();
                    assertThat(result.unitRandomValue()).isNull();
                });

        assertThat(outcome.sortedNormalHash()).hasSize(64);
        assertThat(outcome.sortedWinnerHash()).hasSize(64);
        assertThat(outcome.sortedApartmentHash()).hasSize(64);
        assertThat(outcome.assignmentListHash()).hasSize(64);
        assertThat(outcome.resultHash()).hasSize(64);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private record NormalRank(String lotteryCode, String hash) {
    }
}
