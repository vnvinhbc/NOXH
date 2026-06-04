package com.caovinh.noxh.service;

import com.caovinh.noxh.constant.KycStatus;
import com.caovinh.noxh.constant.Role;
import com.caovinh.noxh.dto.request.LoginRequest;
import com.caovinh.noxh.dto.request.admin.AdminLoginRequest;
import com.caovinh.noxh.dto.response.AuthResponse;
import com.caovinh.noxh.entity.User;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.mapper.UserMapper;
import com.caovinh.noxh.repository.OtpVerificationRepository;
import com.caovinh.noxh.repository.RefreshTokenRepository;
import com.caovinh.noxh.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    RefreshTokenRepository refreshTokenRepository;

    @Mock
    OtpVerificationRepository otpVerificationRepository;

    @Mock
    UserMapper userMapper;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    EmailService emailService;

    @InjectMocks
    AuthService authService;

    @Test
    void login_validCredentials_setsAccessAndRefreshTokenCookies() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("vinh@example.com")
                .fullName("Bui Cao Vinh")
                .password("encoded-password")
                .role(Role.USER)
                .kycStatus(KycStatus.PENDING)
                .isActive(true)
                .isVerified(false)
                .build();
        LoginRequest request = LoginRequest.builder()
                .identifier("vinh@example.com")
                .password("secret")
                .build();
        MockHttpServletResponse response = new MockHttpServletResponse();

        ReflectionTestUtils.setField(authService, "signerKey", "12345678901234567890123456789012");
        ReflectionTestUtils.setField(authService, "validDuration", 300L);
        ReflectionTestUtils.setField(authService, "refreshableDuration", 2592000L);

        when(userRepository.findByIdentifier("vinh@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded-password")).thenReturn(true);
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse result = authService.login(request, response);

        List<String> setCookieHeaders = response.getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(result.getAccessToken()).isNotBlank();
        assertThat(setCookieHeaders).anyMatch(header -> header.startsWith("refresh_token="));
        assertThat(setCookieHeaders).anyMatch(header -> header.startsWith("access_token="));
    }

    @Test
    void loginAdmin_nonAdminUser_throwsAdminAccessRequired() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("vinh@example.com")
                .fullName("Bui Cao Vinh")
                .password("encoded-password")
                .role(Role.USER)
                .kycStatus(KycStatus.PENDING)
                .isActive(true)
                .isVerified(false)
                .build();
        AdminLoginRequest request = AdminLoginRequest.builder()
                .identifier("vinh@example.com")
                .password("secret")
                .otp("123456")
                .build();

        when(userRepository.findByIdentifier("vinh@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.loginAdmin(request, new MockHttpServletResponse()))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.ADMIN_ACCESS_REQUIRED);
    }

    @Test
    void loginAdmin_adminUser_setsAccessAndRefreshTokenCookies() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("admin@noxh.gov.vn")
                .fullName("Admin")
                .password("encoded-password")
                .role(Role.ADMIN)
                .kycStatus(KycStatus.VERIFIED)
                .isActive(true)
                .isVerified(true)
                .build();
        AdminLoginRequest request = AdminLoginRequest.builder()
                .identifier("admin@noxh.gov.vn")
                .password("secret")
                .otp("123456")
                .build();
        MockHttpServletResponse response = new MockHttpServletResponse();

        ReflectionTestUtils.setField(authService, "signerKey", "12345678901234567890123456789012");
        ReflectionTestUtils.setField(authService, "validDuration", 300L);
        ReflectionTestUtils.setField(authService, "refreshableDuration", 2592000L);

        when(userRepository.findByIdentifier("admin@noxh.gov.vn")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded-password")).thenReturn(true);
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse result = authService.loginAdmin(request, response);

        assertThat(result.getRole()).isEqualTo("ADMIN");
        assertThat(response.getHeaders(HttpHeaders.SET_COOKIE)).anyMatch(header -> header.startsWith("access_token="));
    }
}
