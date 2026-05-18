package com.caovinh.noxh.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record DistrictResponse(
        String name,
        int code,
        @JsonProperty("division_type")
        String divisionType,
        String codename,
        @JsonProperty("province_code")
        int provinceCode,
        List<WardResponse> wards
) {
    public DistrictResponse withoutWards() {
        return new DistrictResponse(name, code, divisionType, codename, provinceCode, null);
    }
}
