package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApartmentImportHistoryResponse {
    String id;
    String originalFileName;
    String fileUrl;
    int importedCount;
    LocalDateTime createdAt;
}
