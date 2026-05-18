package com.caovinh.noxh.configuration;

import com.caovinh.noxh.constant.KycStatus;
import com.caovinh.noxh.constant.Role;
import com.caovinh.noxh.entity.User;
import com.caovinh.noxh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            if (!userRepository.existsByEmail("admin@noxh.gov.vn")) {
                User admin = User.builder()
                        .fullName("Quản trị viên NOXH")
                        .email("admin@noxh.gov.vn")
                        .password(passwordEncoder.encode("Admin@123456"))
                        .role(Role.ADMIN)
                        .isVerified(true)
                        .kycStatus(KycStatus.VERIFIED)
                        .build();
                userRepository.save(admin);
                log.info("Admin user created: admin@noxh.gov.vn / Admin@123456");
            }
        };
    }
}
