package com.caovinh.noxh.dto.request.lottery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateLotteryEventRequest {

    @NotNull
    UUID projectId;

    @NotBlank
    String name;

    @NotNull
    LocalDateTime scheduledStartAt;
}
