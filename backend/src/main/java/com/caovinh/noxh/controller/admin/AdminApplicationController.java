package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.dto.request.admin.AdminApplicationStatusRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationOverviewResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationStatus;
import com.caovinh.noxh.service.admin.AdminApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/applications")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminApplicationController {

    AdminApplicationService adminApplicationService;

    @GetMapping
    ApiResponse<List<AdminApplicationResponse>> getApplications(
            @RequestParam(value = "status", required = false) AdminApplicationStatus status,
            @RequestParam(value = "limit", defaultValue = "250") int limit) {
        return ApiResponse.<List<AdminApplicationResponse>>builder()
                .result(adminApplicationService.getApplications(status, limit))
                .build();
    }

    @GetMapping("/overview")
    ApiResponse<AdminApplicationOverviewResponse> getOverview() {
        return ApiResponse.<AdminApplicationOverviewResponse>builder()
                .result(adminApplicationService.getOverview())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<AdminApplicationResponse> getApplication(@PathVariable UUID id) {
        return ApiResponse.<AdminApplicationResponse>builder()
                .result(adminApplicationService.getApplication(id))
                .build();
    }

    @PatchMapping("/{id}/status")
    ApiResponse<AdminApplicationResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AdminApplicationStatusRequest request) {
        return ApiResponse.<AdminApplicationResponse>builder()
                .result(adminApplicationService.updateStatus(id, request))
                .build();
    }
}
