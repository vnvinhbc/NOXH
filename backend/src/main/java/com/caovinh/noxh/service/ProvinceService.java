package com.caovinh.noxh.service;

import com.caovinh.noxh.dto.response.DistrictResponse;
import com.caovinh.noxh.dto.response.ProvinceResponse;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProvinceService {

    final ObjectMapper objectMapper = new ObjectMapper();

    List<ProvinceResponse> provinces;
    Map<Integer, ProvinceResponse> provincesByCode;
    Map<Integer, DistrictResponse> districtsByCode;

    @PostConstruct
    void loadProvinceData() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/download.json");
        provinces = objectMapper.readValue(resource.getInputStream(), new TypeReference<>() {});
        provincesByCode = provinces.stream()
                .collect(Collectors.toUnmodifiableMap(ProvinceResponse::code, Function.identity()));
        districtsByCode = provinces.stream()
                .flatMap(province -> province.districts().stream())
                .collect(Collectors.toUnmodifiableMap(DistrictResponse::code, Function.identity()));
    }

    public List<ProvinceResponse> getProvinces() {
        return provinces.stream()
                .map(ProvinceResponse::withoutDistricts)
                .toList();
    }

    public ProvinceResponse getDistricts(int provinceCode) {
        ProvinceResponse province = provincesByCode.get(provinceCode);
        if (province == null) {
            throw new AppException(ErrorCode.PROVINCE_NOT_FOUND);
        }

        List<DistrictResponse> districts = province.districts().stream()
                .map(DistrictResponse::withoutWards)
                .toList();
        return new ProvinceResponse(
                province.name(),
                province.code(),
                province.divisionType(),
                province.codename(),
                province.phoneCode(),
                districts);
    }

    public DistrictResponse getWards(int districtCode) {
        DistrictResponse district = districtsByCode.get(districtCode);
        if (district == null) {
            throw new AppException(ErrorCode.DISTRICT_NOT_FOUND);
        }

        return district;
    }
}
