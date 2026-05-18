package com.caovinh.noxh.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationResponse {

    String id;
    String userId;
    String projectId;
    String projectName;
    String status;
    Integer priorityScore;
    String lotteryNumber;
    String province;
    String district;
    String ward;
    String detailedAddress;
    Integer householdSize;
    String priorityCategory;
    Long incomePerMonth;
    String taxCode;
    String lotteryResult;
    LocalDateTime submittedAt;
    LocalDateTime createdAt;
    List<ApplicationDocumentResponse> documents;
}
