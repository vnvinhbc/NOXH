package com.caovinh.noxh.service;

import com.caovinh.noxh.entity.Application;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PriorityScoringServiceTest {

    PriorityScoringService priorityScoringService = new PriorityScoringService();

    @Test
    void calculateScore_returnsZeroWhenNoPriorityCategory() {
        Application application = Application.builder()
                .priorityCategory("Khong")
                .incomePerMonth(12_000_000L)
                .householdSize(2)
                .build();

        int score = priorityScoringService.calculateScore(application);

        assertThat(score).isZero();
    }

    @Test
    void calculateScore_returnsPositiveScoreWhenPriorityCategoryExists() {
        Application application = Application.builder()
                .priorityCategory("Nguoi co cong voi cach mang")
                .incomePerMonth(5_000_000L)
                .householdSize(4)
                .build();

        int score = priorityScoringService.calculateScore(application);

        assertThat(score).isEqualTo(100);
    }
}
