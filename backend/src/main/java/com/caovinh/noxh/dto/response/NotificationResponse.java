package com.caovinh.noxh.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {

    String id;
    String title;
    String content;
    String type;
    Boolean isRead;
    LocalDateTime createdAt;
}
