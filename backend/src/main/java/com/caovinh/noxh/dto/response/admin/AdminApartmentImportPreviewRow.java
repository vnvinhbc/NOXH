package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApartmentImportPreviewRow {
    int row;
    String apartmentCode;
    String building;
    String blockName;
    Integer floor;
    String unitNumber;
    BigDecimal areaSqm;
    Integer bedroomCount;
    String direction;
    Long pricePerSqm;
    Long totalPrice;
    String status;
}
