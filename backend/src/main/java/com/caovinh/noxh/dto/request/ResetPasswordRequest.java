package com.caovinh.noxh.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {

    @NotBlank(message = "FIELD_REQUIRED")
    String email;

    @NotBlank(message = "FIELD_REQUIRED")
    String otp;

    @NotBlank(message = "FIELD_REQUIRED")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String newPassword;
}
