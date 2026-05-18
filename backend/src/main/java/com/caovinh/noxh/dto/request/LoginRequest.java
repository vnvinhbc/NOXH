package com.caovinh.noxh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginRequest {

    @NotBlank(message = "FIELD_REQUIRED")
    String identifier;

    @NotBlank(message = "FIELD_REQUIRED")
    String password;
}
