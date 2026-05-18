package com.caovinh.noxh.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApplicationRequest {

    @NotNull(message = "FIELD_REQUIRED")
    UUID projectId;

    String province;
    String district;
    String ward;
    String detailedAddress;
    Integer householdSize;
    String priorityCategory;
    Long incomePerMonth;
    String taxCode;
}
