package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.entity.ApartmentUnit;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.repository.ApartmentUnitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminHousingStockServiceTest {

    @Mock
    ApartmentUnitRepository apartmentUnitRepository;

    @InjectMocks
    AdminHousingStockService adminHousingStockService;

    @Test
    void getUnits_projectOnly_returnsAllStatusesOrderedByApartmentCode() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Green Sky").build();
        ApartmentUnit locked = ApartmentUnit.builder()
                .id(UUID.randomUUID())
                .project(project)
                .apartmentCode("A-0102")
                .building("A")
                .floor(1)
                .unitNumber("0102")
                .areaSqm(new BigDecimal("55.5"))
                .bedroomCount(2)
                .pricePerSqm(18_000_000L)
                .totalPrice(999_000_000L)
                .status(ApartmentUnitStatus.LOCKED)
                .build();

        when(apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId))
                .thenReturn(List.of(locked));

        List<ApartmentUnitResponse> result = adminHousingStockService.getUnits(projectId, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getApartmentCode()).isEqualTo("A-0102");
        assertThat(result.get(0).getStatus()).isEqualTo("LOCKED");
        assertThat(result.get(0).getAreaSqm()).isEqualByComparingTo("55.5");
    }

    @Test
    void getUnits_withStatus_filtersByProjectAndStatus() {
        UUID projectId = UUID.randomUUID();
        when(apartmentUnitRepository.findByProjectIdAndStatusOrderByApartmentCodeAsc(projectId, ApartmentUnitStatus.AVAILABLE))
                .thenReturn(List.of());

        List<ApartmentUnitResponse> result = adminHousingStockService.getUnits(projectId, ApartmentUnitStatus.AVAILABLE);

        assertThat(result).isEmpty();
    }

    @Test
    void getOverview_countsActualApartmentUnitsForProject() {
        UUID projectId = UUID.randomUUID();
        when(apartmentUnitRepository.countByProjectId(projectId)).thenReturn(80L);
        when(apartmentUnitRepository.countByProjectIdAndStatus(projectId, ApartmentUnitStatus.AVAILABLE)).thenReturn(80L);

        var result = adminHousingStockService.getOverview(projectId);

        assertThat(result.getTotalUnits()).isEqualTo(80L);
        assertThat(result.getAvailableUnits()).isEqualTo(80L);
    }
}
