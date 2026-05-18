package com.caovinh.noxh.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectResponse {

    String id;
    String name;
    String description;
    String location;
    String province;
    Integer totalUnits;
    Integer availableUnits;
    Long pricePerSqm;
    Double minArea;
    Double maxArea;
    LocalDate registrationStart;
    LocalDate registrationEnd;
    LocalDateTime lotteryDate;
    String status;
    String imageUrl;
    Long daysRemaining;
}
