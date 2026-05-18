package com.caovinh.noxh.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ProvinceResponse(
        String name,
        int code,
        @JsonProperty("division_type")
        String divisionType,
        String codename,
        @JsonProperty("phone_code")
        int phoneCode,
        List<DistrictResponse> districts
) {
    public ProvinceResponse withoutDistricts() {
        return new ProvinceResponse(name, code, divisionType, codename, phoneCode, null);
    }
}
