package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApartmentImportResponse {
    boolean success;
    int importedCount;
    String fileUrl;
    String fileName;
    @Builder.Default
    List<AdminApartmentImportError> errors = List.of();
}
