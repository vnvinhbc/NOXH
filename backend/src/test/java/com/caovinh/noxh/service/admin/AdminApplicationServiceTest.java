package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.dto.request.admin.AdminApplicationStatusRequest;
import com.caovinh.noxh.dto.response.admin.AdminApplicationPageResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationStatus;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.Notification;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.entity.User;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.NotificationRepository;
import com.caovinh.noxh.service.PriorityScoringService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminApplicationServiceTest {

    @Mock
    ApplicationRepository applicationRepository;

    @Mock
    NotificationRepository notificationRepository;

    @Spy
    PriorityScoringService priorityScoringService = new PriorityScoringService();

    @InjectMocks
    AdminApplicationService adminApplicationService;

    @Test
    void getApplications_filtersAndMapsPendingApplications() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Nguyen Van A")
                .email("a@example.com")
                .build();
        Project project = Project.builder()
                .id(UUID.randomUUID())
                .name("Green Sky")
                .build();
        Application submitted = Application.builder()
                .id(UUID.randomUUID())
                .user(user)
                .project(project)
                .status(ApplicationStatus.SUBMITTED)
                .priorityScore(100)
                .build();
        Application approved = Application.builder()
                .id(UUID.randomUUID())
                .user(user)
                .project(project)
                .status(ApplicationStatus.APPROVED)
                .priorityScore(200)
                .build();

        when(applicationRepository.findAdminApplicationsByStatuses(any(), any()))
                .thenReturn(new PageImpl<>(List.of(submitted)));

        List<AdminApplicationResponse> result = adminApplicationService.getApplications(AdminApplicationStatus.PENDING);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo("PENDING");
        assertThat(result.get(0).getUserFullName()).isEqualTo("Nguyen Van A");
        verify(applicationRepository).findAdminApplicationsByStatuses(
                List.of(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW),
                PageRequest.of(0, 250));
    }

    @Test
    void getApplicationsPage_returnsPaginationMetadata() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Nguyen Van A")
                .email("a@example.com")
                .build();
        Project project = Project.builder()
                .id(UUID.randomUUID())
                .name("Green Sky")
                .build();
        Application approved = Application.builder()
                .id(UUID.randomUUID())
                .user(user)
                .project(project)
                .status(ApplicationStatus.APPROVED)
                .priorityScore(100)
                .build();
        PageRequest pageRequest = PageRequest.of(2, 25);

        when(applicationRepository.findAdminApplicationsByStatuses(
                List.of(ApplicationStatus.APPROVED),
                pageRequest)).thenReturn(new PageImpl<>(List.of(approved), pageRequest, 76));

        AdminApplicationPageResponse result = adminApplicationService.getApplicationsPage(AdminApplicationStatus.VERIFIED, 2, 25);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getPage()).isEqualTo(2);
        assertThat(result.getLimit()).isEqualTo(25);
        assertThat(result.getTotalElements()).isEqualTo(76);
        assertThat(result.getTotalPages()).isEqualTo(4);
        assertThat(result.isFirst()).isFalse();
        assertThat(result.isLast()).isFalse();
    }

    @Test
    void getOverview_usesLightweightCountsAndRecentRows() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Nguyen Van A")
                .email("a@example.com")
                .build();
        Project project = Project.builder()
                .id(UUID.randomUUID())
                .name("Lottery Test")
                .build();
        Application recent = Application.builder()
                .id(UUID.randomUUID())
                .user(user)
                .project(project)
                .status(ApplicationStatus.APPROVED)
                .priorityScore(100)
                .build();

        when(applicationRepository.countByStatusIn(List.of(
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_REVIEW,
                ApplicationStatus.APPROVED,
                ApplicationStatus.REJECTED))).thenReturn(200L);
        when(applicationRepository.countByStatusIn(List.of(
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_REVIEW))).thenReturn(5L);
        when(applicationRepository.countByStatus(ApplicationStatus.APPROVED)).thenReturn(180L);
        when(applicationRepository.countByStatus(ApplicationStatus.REJECTED)).thenReturn(15L);
        when(applicationRepository.findAdminApplicationsByStatuses(
                List.of(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED),
                PageRequest.of(0, 7))).thenReturn(new PageImpl<>(List.of(recent), PageRequest.of(0, 7), 1));

        var result = adminApplicationService.getOverview();

        assertThat(result.getTotalApplications()).isEqualTo(200L);
        assertThat(result.getPendingApplications()).isEqualTo(5L);
        assertThat(result.getApprovedApplications()).isEqualTo(180L);
        assertThat(result.getRejectedApplications()).isEqualTo(15L);
        assertThat(result.getRecentApplications()).hasSize(1);
        assertThat(result.getRecentApplications().get(0).getStatus()).isEqualTo("VERIFIED");
    }

    @Test
    void getApplication_returnsDetail() {
        UUID applicationId = UUID.randomUUID();
        Application application = Application.builder()
                .id(applicationId)
                .user(User.builder().id(UUID.randomUUID()).fullName("Nguyen Van A").email("a@example.com").build())
                .project(Project.builder().id(UUID.randomUUID()).name("Lottery Test").build())
                .status(ApplicationStatus.APPROVED)
                .priorityScore(100)
                .build();

        when(applicationRepository.findAdminApplicationById(applicationId)).thenReturn(Optional.of(application));

        AdminApplicationResponse result = adminApplicationService.getApplication(applicationId);

        assertThat(result.getId()).isEqualTo(applicationId.toString());
        assertThat(result.getUserFullName()).isEqualTo("Nguyen Van A");
        assertThat(result.getStatus()).isEqualTo("VERIFIED");
    }

    @Test
    void updateStatus_verified_mapsToApproved() {
        Application application = Application.builder()
                .id(UUID.randomUUID())
                .user(User.builder().id(UUID.randomUUID()).fullName("Admin").email("admin@example.com").build())
                .project(Project.builder().id(UUID.randomUUID()).name("Green Sky").build())
                .status(ApplicationStatus.SUBMITTED)
                .priorityCategory("Nguoi co cong voi cach mang")
                .incomePerMonth(5_000_000L)
                .householdSize(4)
                .build();

        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        when(applicationRepository.save(application)).thenReturn(application);

        AdminApplicationResponse result = adminApplicationService.updateStatus(
                application.getId(),
                AdminApplicationStatusRequest.builder().status(AdminApplicationStatus.VERIFIED).build());

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPROVED);
        assertThat(application.getPriorityScore()).isEqualTo(100);
        assertThat(result.getStatus()).isEqualTo("VERIFIED");
        assertThat(result.getPriorityScore()).isEqualTo(100);
    }

    @Test
    void updateStatus_missingApplication_throwsNotFound() {
        UUID applicationId = UUID.randomUUID();
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminApplicationService.updateStatus(
                applicationId,
                AdminApplicationStatusRequest.builder().status(AdminApplicationStatus.REJECTED).build()))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.APPLICATION_NOT_FOUND);
    }

    @Test
    void updateStatus_rejectedWithoutReason_throwsValidationError() {
        Application application = Application.builder()
                .id(UUID.randomUUID())
                .user(User.builder().id(UUID.randomUUID()).fullName("Admin").email("admin@example.com").build())
                .project(Project.builder().id(UUID.randomUUID()).name("Green Sky").build())
                .status(ApplicationStatus.SUBMITTED)
                .build();

        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> adminApplicationService.updateStatus(
                application.getId(),
                AdminApplicationStatusRequest.builder()
                        .status(AdminApplicationStatus.REJECTED)
                        .reason("   ")
                        .build()))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.REJECTION_REASON_REQUIRED);
    }

    @Test
    void updateStatus_rejected_storesReasonAndCreatesNotification() {
        UUID userId = UUID.randomUUID();
        Application application = Application.builder()
                .id(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                .user(User.builder().id(userId).fullName("Nguyen Van A").email("a@example.com").build())
                .project(Project.builder().id(UUID.randomUUID()).name("Green Sky").build())
                .status(ApplicationStatus.UNDER_REVIEW)
                .build();

        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        when(applicationRepository.save(application)).thenReturn(application);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminApplicationResponse result = adminApplicationService.updateStatus(
                application.getId(),
                AdminApplicationStatusRequest.builder()
                        .status(AdminApplicationStatus.REJECTED)
                        .reason("Thiếu giấy xác nhận thu nhập")
                        .build());

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        Notification notification = notificationCaptor.getValue();

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        assertThat(application.getRejectReason()).isEqualTo("Thiếu giấy xác nhận thu nhập");
        assertThat(notification.getUser().getId()).isEqualTo(userId);
        assertThat(notification.getTitle()).isEqualTo("Hồ sơ bị từ chối");
        assertThat(notification.getContent()).contains("Thiếu giấy xác nhận thu nhập");
        assertThat(notification.getContent()).contains("HA-123E4567");
        assertThat(result.getStatus()).isEqualTo("REJECTED");
        assertThat(result.getRejectReason()).isEqualTo("Thiếu giấy xác nhận thu nhập");
    }
}
