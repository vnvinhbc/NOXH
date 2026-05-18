package com.caovinh.noxh.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthResponse {

    String accessToken;
    String userId;
    String fullName;
    String email;
    String role;
}
