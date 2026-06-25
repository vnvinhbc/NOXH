package com.caovinh.noxh.dto.request.admin;

import com.caovinh.noxh.constant.ProjectStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminProjectRequest {

    @NotBlank
    String name;

    String description;
    String location;
    String province;

    @PositiveOrZero
    Long pricePerSqm;

    LocalDate registrationStart;
    LocalDate registrationEnd;
    LocalDateTime lotteryDate;

    @NotNull
    ProjectStatus status;
}
