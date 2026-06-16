package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.service.admin.AdminHousingStockService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/housing-stock")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminHousingStockController {

    AdminHousingStockService adminHousingStockService;

    @GetMapping
    ApiResponse<List<ApartmentUnitResponse>> getUnits(
            @RequestParam UUID projectId,
            @RequestParam(required = false) ApartmentUnitStatus status
    ) {
        return ApiResponse.<List<ApartmentUnitResponse>>builder()
                .result(adminHousingStockService.getUnits(projectId, status))
                .build();
    }
}
