package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.dto.request.admin.AdminApplicationStatusRequest;
import com.caovinh.noxh.dto.response.ApplicationDocumentResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationOverviewResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationPageResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationStatus;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.ApplicationDocument;
import com.caovinh.noxh.entity.Notification;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.NotificationRepository;
import com.caovinh.noxh.service.PriorityScoringService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminApplicationService {

    static final int DEFAULT_APPLICATION_LIMIT = 250;
    static final int MAX_APPLICATION_LIMIT = 500;
    static final int DEFAULT_PAGE_LIMIT = 25;

    ApplicationRepository applicationRepository;
    NotificationRepository notificationRepository;
    PriorityScoringService priorityScoringService;

    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> getApplications(AdminApplicationStatus status) {
        return getApplications(status, DEFAULT_APPLICATION_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> getApplications(AdminApplicationStatus status, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, MAX_APPLICATION_LIMIT));
        return applicationRepository.findAdminApplicationsByStatuses(
                        statusesFor(status),
                        PageRequest.of(0, safeLimit))
                .getContent()
                .stream()
                .map(application -> toResponse(application, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminApplicationPageResponse getApplicationsPage(AdminApplicationStatus status, int page, int limit) {
        int safePage = Math.max(0, page);
        int safeLimit = Math.max(1, Math.min(limit <= 0 ? DEFAULT_PAGE_LIMIT : limit, MAX_APPLICATION_LIMIT));
        Page<Application> applications = applicationRepository.findAdminApplicationsByStatuses(
                statusesFor(status),
                PageRequest.of(safePage, safeLimit));
        List<AdminApplicationResponse> items = applications.getContent().stream()
                .map(application -> toResponse(application, false))
                .toList();

        return AdminApplicationPageResponse.builder()
                .items(items)
                .page(applications.getNumber())
                .limit(applications.getSize())
                .totalElements(applications.getTotalElements())
                .totalPages(applications.getTotalPages())
                .first(applications.isFirst())
                .last(applications.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminApplicationOverviewResponse getOverview() {
        List<ApplicationStatus> adminStatuses = statusesFor(null);
        long total = applicationRepository.countByStatusIn(adminStatuses);
        long pending = applicationRepository.countByStatusIn(statusesFor(AdminApplicationStatus.PENDING));
        long approved = applicationRepository.countByStatus(ApplicationStatus.APPROVED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        List<AdminApplicationResponse> recent = applicationRepository.findAdminApplicationsByStatuses(
                        adminStatuses,
                PageRequest.of(0, 7))
                .getContent()
                .stream()
                .map(application -> toResponse(application, false))
                .toList();

        return AdminApplicationOverviewResponse.builder()
                .totalApplications(total)
                .pendingApplications(pending)
                .approvedApplications(approved)
                .rejectedApplications(rejected)
                .recentApplications(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminApplicationResponse getApplication(UUID applicationId) {
        Application application = applicationRepository.findAdminApplicationById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));
        return toResponse(application, true);
    }

    @Transactional
    public AdminApplicationResponse updateStatus(UUID applicationId, AdminApplicationStatusRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        ApplicationStatus nextStatus = mapToApplicationStatus(request.getStatus());
        String reason = request.getReason() == null ? null : request.getReason().trim();

        if (nextStatus == ApplicationStatus.REJECTED && (reason == null || reason.isBlank())) {
            throw new AppException(ErrorCode.REJECTION_REASON_REQUIRED);
        }

        application.setStatus(nextStatus);
        application.setPriorityScore(nextStatus == ApplicationStatus.APPROVED
                ? priorityScoringService.calculateScore(application)
                : 0);
        application.setRejectReason(nextStatus == ApplicationStatus.REJECTED ? reason : null);
        Application savedApplication = applicationRepository.save(application);
        createStatusNotification(savedApplication);
        return toResponse(savedApplication, true);
    }

    private AdminApplicationResponse toResponse(Application application) {
        return toResponse(application, true);
    }

    private AdminApplicationResponse toResponse(Application application, boolean includeDocuments) {
        List<ApplicationDocumentResponse> documents = application.getDocuments() == null
                ? List.of()
                : includeDocuments ? application.getDocuments().stream()
                .sorted(Comparator.comparing(ApplicationDocument::getUploadedAt))
                .map(document -> ApplicationDocumentResponse.builder()
                        .id(document.getId().toString())
                        .documentType(document.getDocumentType().name())
                        .fileUrl(document.getFileUrl())
                        .fileName(document.getFileName())
                        .status(document.getStatus())
                        .uploadedAt(document.getUploadedAt())
                        .build())
                .toList() : List.of();

        return AdminApplicationResponse.builder()
                .id(application.getId().toString())
                .applicationCode("HA-" + application.getId().toString().substring(0, 8).toUpperCase())
                .userId(application.getUser().getId().toString())
                .userFullName(application.getUser().getFullName())
                .userEmail(application.getUser().getEmail())
                .projectId(application.getProject().getId().toString())
                .projectName(application.getProject().getName())
                .status(mapStatus(application.getStatus()).name())
                .priorityScore(application.getPriorityScore())
                .province(application.getProvince())
                .district(application.getDistrict())
                .ward(application.getWard())
                .detailedAddress(application.getDetailedAddress())
                .householdSize(application.getHouseholdSize())
                .priorityCategory(application.getPriorityCategory())
                .incomePerMonth(application.getIncomePerMonth())
                .lotteryNumber(application.getLotteryNumber())
                .lotteryResult(application.getLotteryResult())
                .rejectReason(application.getRejectReason())
                .submittedAt(application.getSubmittedAt())
                .createdAt(application.getCreatedAt())
                .documents(documents)
                .build();
    }

    private void createStatusNotification(Application application) {
        Notification notification = switch (application.getStatus()) {
            case APPROVED -> Notification.builder()
                    .user(application.getUser())
                    .title("Hồ sơ đã được duyệt")
                    .content("Mã hồ sơ của bạn là " + buildApplicationCode(application) + ". Hồ sơ đã được admin phê duyệt.")
                    .type("APPLICATION_APPROVED")
                    .build();
            case REJECTED -> Notification.builder()
                    .user(application.getUser())
                    .title("Hồ sơ bị từ chối")
                    .content("Mã hồ sơ " + buildApplicationCode(application) + " bị từ chối. Lý do: "
                            + application.getRejectReason())
                    .type("APPLICATION_REJECTED")
                    .build();
            default -> null;
        };

        if (notification != null) {
            notificationRepository.save(notification);
        }
    }

    private String buildApplicationCode(Application application) {
        return "HA-" + application.getId().toString().substring(0, 8).toUpperCase();
    }

    private AdminApplicationStatus mapStatus(ApplicationStatus status) {
        return switch (status) {
            case SUBMITTED, UNDER_REVIEW -> AdminApplicationStatus.PENDING;
            case APPROVED -> AdminApplicationStatus.VERIFIED;
            case REJECTED -> AdminApplicationStatus.REJECTED;
            default -> null;
        };
    }

    private ApplicationStatus mapToApplicationStatus(AdminApplicationStatus status) {
        return switch (status) {
            case PENDING -> ApplicationStatus.UNDER_REVIEW;
            case VERIFIED -> ApplicationStatus.APPROVED;
            case REJECTED -> ApplicationStatus.REJECTED;
        };
    }

    private List<ApplicationStatus> statusesFor(AdminApplicationStatus status) {
        if (status == null) {
            return List.of(
                    ApplicationStatus.SUBMITTED,
                    ApplicationStatus.UNDER_REVIEW,
                    ApplicationStatus.APPROVED,
                    ApplicationStatus.REJECTED);
        }
        return switch (status) {
            case PENDING -> List.of(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW);
            case VERIFIED -> List.of(ApplicationStatus.APPROVED);
            case REJECTED -> List.of(ApplicationStatus.REJECTED);
        };
    }
}
