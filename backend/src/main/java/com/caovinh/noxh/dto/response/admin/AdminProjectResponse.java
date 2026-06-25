package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminProjectResponse {
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
    boolean businessActive;
    LocalDateTime createdAt;
}
