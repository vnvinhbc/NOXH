package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminLotteryAuditLogResponse {
    String id;
    String eventId;
    String eventName;
    String projectName;
    String eventType;
    String payload;
    String previousHash;
    String currentHash;
    LocalDateTime createdAt;
}
