package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.dto.request.admin.AdminLoginRequest;
import com.caovinh.noxh.dto.response.AuthResponse;
import com.caovinh.noxh.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminAuthService {

    AuthService authService;

    public AuthResponse login(AdminLoginRequest request, HttpServletResponse response) {
        return authService.loginAdmin(request, response);
    }
}
