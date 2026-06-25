package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.ProjectStatus;
import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.request.admin.AdminApartmentRequest;
import com.caovinh.noxh.dto.request.admin.AdminProjectRequest;
import com.caovinh.noxh.entity.ApartmentUnit;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.*;
import com.caovinh.noxh.service.ImageKitService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminProjectServiceTest {

    @Mock ProjectRepository projectRepository;
    @Mock ApplicationRepository applicationRepository;
    @Mock LotteryEventRepository lotteryEventRepository;
    @Mock ApartmentUnitRepository apartmentUnitRepository;
    @Mock ApartmentImportHistoryRepository apartmentImportHistoryRepository;
    @Mock ImageKitService imageKitService;

    @InjectMocks AdminProjectService adminProjectService;

    @Test
    void updateProject_whenBusinessActive_throwsConflict() {
        UUID projectId = UUID.randomUUID();
        when(projectRepository.findById(projectId))
                .thenReturn(Optional.of(Project.builder().id(projectId).name("Active").build()));
        when(applicationRepository.existsByProjectId(projectId)).thenReturn(true);

        assertThatThrownBy(() -> adminProjectService.updateProject(projectId, projectRequest(), null))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.PROJECT_BUSINESS_ACTIVE);

        verify(projectRepository, never()).save(any());
    }

    @Test
    void deleteProject_withoutBusinessActivity_deletesProject() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Draft").build();
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        adminProjectService.deleteProject(projectId);

        verify(projectRepository).delete(project);
    }

    @Test
    void createApartment_recalculatesProjectTotals() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Draft").build();
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(apartmentUnitRepository.save(any(ApartmentUnit.class))).thenAnswer(invocation -> {
            ApartmentUnit apartment = invocation.getArgument(0);
            apartment.setId(UUID.randomUUID());
            return apartment;
        });
        when(apartmentUnitRepository.countByProjectId(projectId)).thenReturn(3L);
        when(apartmentUnitRepository.countByProjectIdAndStatus(projectId, ApartmentUnitStatus.AVAILABLE)).thenReturn(2L);

        var result = adminProjectService.createApartment(projectId, apartmentRequest());

        assertThat(result.getApartmentCode()).isEqualTo("A-0101");
        assertThat(project.getTotalUnits()).isEqualTo(3);
        assertThat(project.getAvailableUnits()).isEqualTo(2);
        verify(projectRepository).save(project);
    }

    @Test
    void updateApartment_whenLocked_throwsConflict() {
        UUID projectId = UUID.randomUUID();
        UUID apartmentId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Draft").build();
        ApartmentUnit apartment = ApartmentUnit.builder()
                .id(apartmentId)
                .project(project)
                .apartmentCode("A-0101")
                .status(ApartmentUnitStatus.LOCKED)
                .build();
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(apartmentUnitRepository.findById(apartmentId)).thenReturn(Optional.of(apartment));

        assertThatThrownBy(() -> adminProjectService.updateApartment(projectId, apartmentId, apartmentRequest()))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.APARTMENT_UNIT_LOCKED);
    }

    private AdminProjectRequest projectRequest() {
        return AdminProjectRequest.builder()
                .name("New Project")
                .registrationStart(LocalDate.now())
                .registrationEnd(LocalDate.now().plusDays(30))
                .status(ProjectStatus.OPEN)
                .build();
    }

    private AdminApartmentRequest apartmentRequest() {
        return AdminApartmentRequest.builder()
                .apartmentCode("A-0101")
                .areaSqm(new BigDecimal("50.5"))
                .bedroomCount(2)
                .pricePerSqm(16_000_000L)
                .totalPrice(808_000_000L)
                .status(ApartmentUnitStatus.AVAILABLE)
                .build();
    }
}
