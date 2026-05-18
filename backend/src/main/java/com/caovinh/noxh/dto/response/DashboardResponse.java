package com.caovinh.noxh.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardResponse {

    ApplicationResponse currentApplication;
    List<NotificationResponse> recentNotifications;
    DashboardStats stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        long totalApplications;
        long approvedCount;
        long pendingCount;
    }
}
