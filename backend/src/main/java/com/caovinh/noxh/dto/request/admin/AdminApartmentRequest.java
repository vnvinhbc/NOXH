package com.caovinh.noxh.dto.request.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApartmentRequest {

    @NotBlank
    String apartmentCode;

    String building;
    String blockName;
    Integer floor;
    String unitNumber;

    @NotNull
    @DecimalMin(value = "0.01")
    BigDecimal areaSqm;

    @PositiveOrZero
    Integer bedroomCount;

    String direction;

    @NotNull
    @Positive
    Long pricePerSqm;

    @PositiveOrZero
    Long totalPrice;

    @NotNull
    ApartmentUnitStatus status;
}
