package com.caovinh.noxh.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminLoginRequest {

    @NotBlank(message = "FIELD_REQUIRED")
    String identifier;

    @NotBlank(message = "FIELD_REQUIRED")
    String password;

    @NotBlank(message = "FIELD_REQUIRED")
    @Pattern(regexp = "\\d{6}", message = "INVALID_FORMAT")
    String otp;
}
