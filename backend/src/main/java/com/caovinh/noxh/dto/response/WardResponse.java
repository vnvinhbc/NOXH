package com.caovinh.noxh.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WardResponse(
        String name,
        int code,
        @JsonProperty("division_type")
        String divisionType,
        String codename,
        @JsonProperty("district_code")
        int districtCode
) {
}
