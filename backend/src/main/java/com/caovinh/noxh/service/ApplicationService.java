package com.caovinh.noxh.service;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.dto.request.ApplicationRequest;
import com.caovinh.noxh.dto.response.ApplicationResponse;
import com.caovinh.noxh.dto.response.DashboardResponse;
import com.caovinh.noxh.dto.response.NotificationResponse;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.entity.User;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.mapper.ApplicationMapper;
import com.caovinh.noxh.mapper.NotificationMapper;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.NotificationRepository;
import com.caovinh.noxh.repository.ProjectRepository;
import com.caovinh.noxh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationService {

    ApplicationRepository applicationRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;
    NotificationRepository notificationRepository;
    ApplicationMapper applicationMapper;
    NotificationMapper notificationMapper;

    public List<ApplicationResponse> getMyApplications() {
        UUID userId = getCurrentUserId();
        List<Application> applications = applicationRepository.findByUserId(userId);
        return applicationMapper.toApplicationResponseList(applications);
    }

    public ApplicationResponse getApplicationById(UUID id) {
        UUID userId = getCurrentUserId();
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return applicationMapper.toApplicationResponse(application);
    }

    @Transactional
    public ApplicationResponse createApplication(ApplicationRequest request) {
        UUID userId = getCurrentUserId();

        if (applicationRepository.existsByUserIdAndProjectId(userId, request.getProjectId())) {
            throw new AppException(ErrorCode.APPLICATION_EXISTED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        Application application = Application.builder()
                .user(user)
                .project(project)
                .status(ApplicationStatus.DRAFT)
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .detailedAddress(request.getDetailedAddress())
                .householdSize(request.getHouseholdSize())
                .priorityCategory(request.getPriorityCategory())
                .incomePerMonth(request.getIncomePerMonth())
                .taxCode(request.getTaxCode())
                .priorityScore(0)
                .build();

        application = applicationRepository.save(application);
        return applicationMapper.toApplicationResponse(application);
    }

    public DashboardResponse getDashboard() {
        UUID userId = getCurrentUserId();

        List<Application> applications = applicationRepository.findByUserId(userId);
        Application current = applications.isEmpty() ? null : applications.get(0);

        long total = applications.size();
        long approved = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.APPROVED).count();
        long pending = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED
                        || a.getStatus() == ApplicationStatus.UNDER_REVIEW
                        || a.getStatus() == ApplicationStatus.DRAFT).count();

        List<NotificationResponse> recentNotifications = notificationMapper.toNotificationResponseList(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .limit(5).toList()
        );

        return DashboardResponse.builder()
                .currentApplication(current != null ? applicationMapper.toApplicationResponse(current) : null)
                .recentNotifications(recentNotifications)
                .stats(DashboardResponse.DashboardStats.builder()
                        .totalApplications(total)
                        .approvedCount(approved)
                        .pendingCount(pending)
                        .build())
                .build();
    }

    private UUID getCurrentUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}
