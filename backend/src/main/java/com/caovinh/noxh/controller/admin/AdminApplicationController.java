package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.dto.request.admin.AdminApplicationStatusRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
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
            @RequestParam(value = "status", required = false) AdminApplicationStatus status) {
        return ApiResponse.<List<AdminApplicationResponse>>builder()
                .result(adminApplicationService.getApplications(status))
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
