package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.DistrictResponse;
import com.caovinh.noxh.dto.response.ProvinceResponse;
import com.caovinh.noxh.service.ProvinceService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/provinces")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProvinceController {

    ProvinceService provinceService;

    @GetMapping
    ApiResponse<List<ProvinceResponse>> getProvinces() {
        return ApiResponse.<List<ProvinceResponse>>builder()
                .result(provinceService.getProvinces())
                .build();
    }

    @GetMapping("/{code}/districts")
    ApiResponse<ProvinceResponse> getDistricts(@PathVariable int code) {
        return ApiResponse.<ProvinceResponse>builder()
                .result(provinceService.getDistricts(code))
                .build();
    }

    @GetMapping("/districts/{code}/wards")
    ApiResponse<DistrictResponse> getWards(@PathVariable int code) {
        return ApiResponse.<DistrictResponse>builder()
                .result(provinceService.getWards(code))
                .build();
    }
}
