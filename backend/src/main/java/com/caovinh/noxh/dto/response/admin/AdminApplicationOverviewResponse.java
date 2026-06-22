package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApplicationOverviewResponse {

    long totalApplications;
    long pendingApplications;
    long approvedApplications;
    long rejectedApplications;
    List<AdminApplicationResponse> recentApplications;
}
