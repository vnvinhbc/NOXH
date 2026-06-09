package com.caovinh.noxh.dto.response.lottery;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryVerificationResponse {
    String eventId;
    String projectName;
    String algorithmType;
    String participantHash;
    String apartmentHash;
    String commitmentHash;
    String privateSalt;
    LocalDate xsmbDrawDate;
    String xsmbResult;
    Long ethChainId;
    Long ethBlockNumber;
    String ethBlockHash;
    LocalDateTime clickedTimestamp;
    String finalSeed;
    String sortedNormalHash;
    String sortedWinnerHash;
    String sortedApartmentHash;
    String assignmentListHash;
    String resultHash;
    List<LotteryParticipantResponse> participants;
    List<ApartmentUnitResponse> apartments;
    List<LotteryResultResponse> results;
}
