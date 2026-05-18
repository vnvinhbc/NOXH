package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.request.*;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.AuthResponse;
import com.caovinh.noxh.dto.response.UserResponse;
import com.caovinh.noxh.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    @PostMapping("/register")
    ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserResponse>builder()
                        .result(authService.register(request))
                        .build());
    }

    @PostMapping("/login")
    ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return ApiResponse.<AuthResponse>builder()
                .result(authService.login(request, response))
                .build();
    }

    @PostMapping("/forgot-password")
    ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.<Void>builder()
                .message("OTP đã được gửi đến email của bạn")
                .build();
    }

    @PostMapping("/verify-otp")
    ApiResponse<Boolean> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ApiResponse.<Boolean>builder()
                .result(authService.verifyOtp(request))
                .build();
    }

    @PostMapping("/reset-password")
    ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.<Void>builder()
                .message("Mật khẩu đã được cập nhật thành công")
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        return ApiResponse.<AuthResponse>builder()
                .result(authService.refreshToken(request, response))
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ApiResponse.<Void>builder()
                .message("Đăng xuất thành công")
                .build();
    }
}
