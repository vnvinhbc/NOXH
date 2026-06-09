package com.caovinh.noxh.dto.request.lottery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StartLotteryRequest {

    @NotNull
    LocalDate xsmbDrawDate;

    @NotBlank
    String xsmbResult;

    @NotNull
    @Positive
    Long ethChainId;

    @NotNull
    @Positive
    Long ethBlockNumber;

    @NotBlank
    @Pattern(regexp = "^0x[a-fA-F0-9]{64}$")
    String ethBlockHash;

    String sourceNote;
}
