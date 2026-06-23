package com.caovinh.noxh.dto.response.lottery;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryResultResponse {
    String eventId;
    String participantId;
    String maskedDisplayName;
    String lotteryCode;
    String poolType;
    String resultType;
    String normalRandomValue;
    String winnerUnitHash;
    String apartmentId;
    String apartmentCode;
    String unitRandomValue;
    Integer drawOrder;
    LocalDateTime createdAt;
}
