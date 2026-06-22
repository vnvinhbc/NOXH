package com.caovinh.noxh.dto.response.lottery;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryEventResponse {
    String id;
    String projectId;
    String projectName;
    String name;
    String status;
    String algorithmType;
    String commitmentHash;
    String participantHash;
    String apartmentHash;
    LocalDate xsmbDrawDate;
    String xsmbResult;
    Long ethChainId;
    Long ethBlockNumber;
    String ethBlockHash;
    String seedSourceNote;
    LocalDateTime scheduledStartAt;
    LocalDateTime clickedTimestamp;
    String finalSeed;
    String sortedNormalHash;
    String sortedWinnerHash;
    String sortedApartmentHash;
    String assignmentListHash;
    String resultHash;
    String failedReason;
    LocalDateTime lockedAt;
    LocalDateTime startedAt;
    LocalDateTime completedAt;
    LocalDateTime createdAt;
    long participantCount;
    long apartmentCount;
    long resultCount;
}
