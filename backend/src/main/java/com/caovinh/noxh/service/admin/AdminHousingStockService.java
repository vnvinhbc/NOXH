package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.response.admin.AdminHousingStockOverviewResponse;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.entity.ApartmentUnit;
import com.caovinh.noxh.repository.ApartmentUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminHousingStockService {

    ApartmentUnitRepository apartmentUnitRepository;

    @Transactional(readOnly = true)
    public AdminHousingStockOverviewResponse getOverview(UUID projectId) {
        return AdminHousingStockOverviewResponse.builder()
                .totalUnits(apartmentUnitRepository.countByProjectId(projectId))
                .availableUnits(apartmentUnitRepository.countByProjectIdAndStatus(projectId, ApartmentUnitStatus.AVAILABLE))
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApartmentUnitResponse> getUnits(UUID projectId, ApartmentUnitStatus status) {
        List<ApartmentUnit> units = status == null
                ? apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId)
                : apartmentUnitRepository.findByProjectIdAndStatusOrderByApartmentCodeAsc(projectId, status);
        return units.stream().map(this::toResponse).toList();
    }

    private ApartmentUnitResponse toResponse(ApartmentUnit apartment) {
        return ApartmentUnitResponse.builder()
                .id(apartment.getId().toString())
                .apartmentCode(apartment.getApartmentCode())
                .building(apartment.getBuilding())
                .blockName(apartment.getBlockName())
                .floor(apartment.getFloor())
                .unitNumber(apartment.getUnitNumber())
                .areaSqm(apartment.getAreaSqm())
                .bedroomCount(apartment.getBedroomCount())
                .direction(apartment.getDirection())
                .pricePerSqm(apartment.getPricePerSqm())
                .totalPrice(apartment.getTotalPrice())
                .status(apartment.getStatus().name())
                .build();
    }
}
