package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.dto.request.admin.AdminApartmentRequest;
import com.caovinh.noxh.entity.ApartmentUnit;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.repository.ApartmentUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ApartmentImportPersistenceService {

    ApartmentUnitRepository apartmentUnitRepository;
    AdminProjectService adminProjectService;

    @Transactional
    public void persist(Project project, List<ApartmentImportParser.ParsedRow> rows) {
        List<ApartmentUnit> apartments = rows.stream()
                .map(row -> toEntity(project, row.request()))
                .toList();
        apartmentUnitRepository.saveAll(apartments);
        apartmentUnitRepository.flush();
        adminProjectService.recalculateProject(project);
    }

    private ApartmentUnit toEntity(Project project, AdminApartmentRequest request) {
        Long totalPrice = request.getTotalPrice() != null
                ? request.getTotalPrice()
                : request.getAreaSqm().multiply(BigDecimal.valueOf(request.getPricePerSqm())).longValue();
        return ApartmentUnit.builder()
                .project(project)
                .apartmentCode(request.getApartmentCode().trim())
                .building(request.getBuilding())
                .blockName(request.getBlockName())
                .floor(request.getFloor())
                .unitNumber(request.getUnitNumber())
                .areaSqm(request.getAreaSqm())
                .bedroomCount(request.getBedroomCount())
                .direction(request.getDirection())
                .pricePerSqm(request.getPricePerSqm())
                .totalPrice(totalPrice)
                .status(request.getStatus())
                .build();
    }
}
