package com.caovinh.noxh.dto.response.lottery;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserLotterySummaryResponse {
    String applicationId;
    String applicationCode;
    String applicationStatus;
    Integer priorityScore;
    String priorityCategory;
    String projectId;
    String projectName;
    String eventId;
    String eventName;
    String eventStatus;
    String algorithmType;
    String lotteryCode;
    String poolType;
    String priorityTags;
    String resultType;
    String apartmentCode;
    Integer drawOrder;
    String normalRandomValue;
    String winnerUnitHash;
    String unitRandomValue;
    String participantHash;
    String apartmentHash;
    String finalSeed;
    String resultHash;
    LocalDateTime scheduledStartAt;
    LocalDateTime lockedAt;
    LocalDateTime startedAt;
    LocalDateTime completedAt;
    LocalDateTime createdAt;
}
