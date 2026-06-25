package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApartmentImportPreviewResponse {
    boolean valid;
    @Builder.Default
    List<AdminApartmentImportPreviewRow> rows = List.of();
    @Builder.Default
    List<AdminApartmentImportError> errors = List.of();
}
