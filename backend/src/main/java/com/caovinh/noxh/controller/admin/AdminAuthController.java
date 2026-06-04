package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.dto.request.admin.AdminLoginRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.AuthResponse;
import com.caovinh.noxh.service.admin.AdminAuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminAuthController {

    AdminAuthService adminAuthService;

    @PostMapping("/login")
    ApiResponse<AuthResponse> login(@Valid @RequestBody AdminLoginRequest request, HttpServletResponse response) {
        return ApiResponse.<AuthResponse>builder()
                .result(adminAuthService.login(request, response))
                .build();
    }
}
