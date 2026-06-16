package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.admin.AdminLotteryAuditLogResponse;
import com.caovinh.noxh.service.admin.AdminLotteryAuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminLotteryAuditLogController {

    AdminLotteryAuditLogService adminLotteryAuditLogService;

    @GetMapping
    ApiResponse<List<AdminLotteryAuditLogResponse>> getLogs(@RequestParam(required = false) UUID eventId) {
        return ApiResponse.<List<AdminLotteryAuditLogResponse>>builder()
                .result(adminLotteryAuditLogService.getLogs(eventId))
                .build();
    }
}
