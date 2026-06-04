package com.caovinh.noxh.dto.response.admin;

import com.caovinh.noxh.dto.response.ApplicationDocumentResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApplicationResponse {

    String id;
    String applicationCode;
    String userId;
    String userFullName;
    String userEmail;
    String projectId;
    String projectName;
    String status;
    Integer priorityScore;
    String province;
    String district;
    String ward;
    String detailedAddress;
    Integer householdSize;
    String priorityCategory;
    Long incomePerMonth;
    String lotteryNumber;
    String lotteryResult;
    String rejectReason;
    LocalDateTime submittedAt;
    LocalDateTime createdAt;
    List<ApplicationDocumentResponse> documents;
}
