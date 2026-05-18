package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.DashboardResponse;
import com.caovinh.noxh.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {

    ApplicationService applicationService;

    @GetMapping
    ApiResponse<DashboardResponse> getDashboard() {
        return ApiResponse.<DashboardResponse>builder()
                .result(applicationService.getDashboard())
                .build();
    }
}
