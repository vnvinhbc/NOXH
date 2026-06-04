package com.caovinh.noxh.dto.request.admin;

import com.caovinh.noxh.dto.response.admin.AdminApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApplicationStatusRequest {

    @NotNull(message = "FIELD_REQUIRED")
    AdminApplicationStatus status;

    String reason;
}
