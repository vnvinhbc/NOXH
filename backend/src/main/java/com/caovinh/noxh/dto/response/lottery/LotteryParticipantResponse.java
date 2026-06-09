package com.caovinh.noxh.dto.response.lottery;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryParticipantResponse {
    String id;
    String applicationId;
    String lotteryCode;
    String poolType;
    String priorityTags;
}
