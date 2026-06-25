package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApartmentImportError {
    int row;
    String field;
    String message;
}
