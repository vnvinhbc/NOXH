package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.request.ApplicationRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.ApplicationResponse;
import com.caovinh.noxh.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationController {

    ApplicationService applicationService;

    @GetMapping
    ApiResponse<List<ApplicationResponse>> getMyApplications() {
        return ApiResponse.<List<ApplicationResponse>>builder()
                .result(applicationService.getMyApplications())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<ApplicationResponse> getApplicationById(@PathVariable UUID id) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(applicationService.getApplicationById(id))
                .build();
    }

    @PostMapping
    ResponseEntity<ApiResponse<ApplicationResponse>> createApplication(
            @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ApplicationResponse>builder()
                        .result(applicationService.createApplication(request))
                        .build());
    }
}
