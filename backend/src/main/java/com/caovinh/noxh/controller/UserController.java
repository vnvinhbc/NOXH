package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.request.KycRequest;
import com.caovinh.noxh.dto.request.UserUpdateRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.UserResponse;
import com.caovinh.noxh.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping("/my-info")
    ApiResponse<UserResponse> updateProfile(@Valid @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateProfile(request))
                .build();
    }

    @PostMapping("/kyc")
    ApiResponse<UserResponse> submitKyc(@Valid @RequestBody KycRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.submitKyc(request))
                .build();
    }
}
