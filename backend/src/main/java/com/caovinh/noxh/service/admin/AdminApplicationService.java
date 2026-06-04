package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.dto.request.admin.AdminApplicationStatusRequest;
import com.caovinh.noxh.dto.response.ApplicationDocumentResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationResponse;
import com.caovinh.noxh.dto.response.admin.AdminApplicationStatus;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.ApplicationDocument;
import com.caovinh.noxh.entity.Notification;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminApplicationService {

    ApplicationRepository applicationRepository;
    NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> getApplications(AdminApplicationStatus status) {
        return applicationRepository.findAll(Sort.by(
                        Sort.Order.desc("submittedAt"),
                        Sort.Order.desc("createdAt")))
                .stream()
                .filter(application -> mapStatus(application.getStatus()) != null)
                .filter(application -> status == null || mapStatus(application.getStatus()) == status)
                .map(this::toResponse)
                .toList();
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
        application.setRejectReason(nextStatus == ApplicationStatus.REJECTED ? reason : null);
        Application savedApplication = applicationRepository.save(application);
        createStatusNotification(savedApplication);
        return toResponse(savedApplication);
    }

    private AdminApplicationResponse toResponse(Application application) {
        List<ApplicationDocumentResponse> documents = application.getDocuments() == null
                ? List.of()
                : application.getDocuments().stream()
                .sorted(Comparator.comparing(ApplicationDocument::getUploadedAt))
                .map(document -> ApplicationDocumentResponse.builder()
                        .id(document.getId().toString())
                        .documentType(document.getDocumentType().name())
                        .fileUrl(document.getFileUrl())
                        .fileName(document.getFileName())
                        .status(document.getStatus())
                        .uploadedAt(document.getUploadedAt())
                        .build())
                .toList();

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
}
