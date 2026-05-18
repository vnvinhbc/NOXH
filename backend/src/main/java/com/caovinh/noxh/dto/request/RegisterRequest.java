package com.caovinh.noxh.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {

    @NotBlank(message = "FIELD_REQUIRED")
    String fullName;

    @NotBlank(message = "FIELD_REQUIRED")
    @Email(message = "INVALID_EMAIL")
    String email;

    String phoneNumber;

    @NotBlank(message = "FIELD_REQUIRED")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    LocalDate dateOfBirth;

    String gender;
}
