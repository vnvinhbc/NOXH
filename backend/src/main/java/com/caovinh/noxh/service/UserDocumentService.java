package com.caovinh.noxh.service;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.constant.DocumentType;
import com.caovinh.noxh.dto.response.FileUploadResponse;
import com.caovinh.noxh.dto.response.UserDocumentResponse;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.ApplicationDocument;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.entity.User;
import com.caovinh.noxh.entity.UserDocument;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.ApplicationDocumentRepository;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.ProjectRepository;
import com.caovinh.noxh.repository.UserDocumentRepository;
import com.caovinh.noxh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@lombok.extern.slf4j.Slf4j
public class UserDocumentService {

    static final Set<DocumentType> REQUIRED_DOCUMENT_TYPES = Set.of(
            DocumentType.CCCD_FRONT,
            DocumentType.CCCD_BACK,
            DocumentType.HOUSEHOLD_REGISTRATION,
            DocumentType.RESIDENCE_CERTIFICATE,
            DocumentType.INCOME_CERTIFICATE
    );

    ImageKitService imageKitService;
    UserDocumentRepository userDocumentRepository;
    UserRepository userRepository;
    ApplicationRepository applicationRepository;
    ApplicationDocumentRepository applicationDocumentRepository;
    ProjectRepository projectRepository;

    public List<UserDocumentResponse> getMyDocuments() {
        UUID userId = getCurrentUserId();
        return userDocumentRepository.findByUserIdOrderByUploadedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserDocumentResponse uploadDocument(DocumentType documentType, MultipartFile file) {
        UUID userId = getCurrentUserId();
        log.info("Received document upload: userId={}, documentType={}, originalName={}, contentType={}, size={}",
                userId, documentType, file.getOriginalFilename(), file.getContentType(), file.getSize());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        FileUploadResponse upload = imageKitService.upload(file, buildStorageFileName(documentType, file));

        UserDocument document = userDocumentRepository.findByUserIdAndDocumentType(userId, documentType)
                .orElseGet(() -> UserDocument.builder()
                        .user(user)
                        .documentType(documentType)
                        .build());
        document.setFileUrl(upload.getUrl());
        document.setFileName(upload.getFileName());
        document.setStatus("UPLOADED");

        UserDocument savedDocument = userDocumentRepository.save(document);
        log.info("Document upload saved successfully: userId={}, documentType={}, documentId={}",
                userId, documentType, savedDocument.getId());
        return toResponse(savedDocument);
    }

    @Transactional
    public boolean submitDocuments() {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<UserDocument> documents = userDocumentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        Set<DocumentType> uploadedTypes = documents.stream()
                .map(UserDocument::getDocumentType)
                .collect(java.util.stream.Collectors.toSet());

        if (!uploadedTypes.containsAll(REQUIRED_DOCUMENT_TYPES)) {
            throw new AppException(ErrorCode.REQUIRED_DOCUMENTS_MISSING);
        }

        Application application = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .findFirst()
                .orElseGet(() -> createApplicationForSubmission(user));

        validateSubmissionAllowed(application);

        application.setProvince(user.getProvince());
        application.setDistrict(user.getDistrict());
        application.setWard(user.getWard());
        application.setDetailedAddress(
                user.getCurrentAddress() != null && !user.getCurrentAddress().isBlank()
                        ? user.getCurrentAddress()
                        : user.getPermanentAddress());
        application.setHouseholdSize(user.getHouseholdSize());
        application.setPriorityCategory(user.getPriorityCategory());
        application.setIncomePerMonth(user.getIncomePerMonth());
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setRejectReason(null);
        application.setSubmittedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);
        applicationDocumentRepository.deleteByApplicationId(savedApplication.getId());

        List<ApplicationDocument> applicationDocuments = documents.stream()
                .map(document -> ApplicationDocument.builder()
                        .application(savedApplication)
                        .documentType(document.getDocumentType())
                        .fileUrl(document.getFileUrl())
                        .fileName(document.getFileName())
                        .status(document.getStatus())
                        .uploadedAt(document.getUploadedAt())
                        .build())
                .toList();
        applicationDocumentRepository.saveAll(applicationDocuments);

        return true;
    }

    private UserDocumentResponse toResponse(UserDocument document) {
        return UserDocumentResponse.builder()
                .id(document.getId().toString())
                .documentType(document.getDocumentType().name())
                .fileUrl(document.getFileUrl())
                .fileName(document.getFileName())
                .status(document.getStatus())
                .uploadedAt(document.getUploadedAt())
                .build();
    }

    private UUID getCurrentUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }

    private String buildStorageFileName(DocumentType documentType, MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null) {
            int extensionIndex = originalFileName.lastIndexOf('.');
            if (extensionIndex >= 0) {
                extension = originalFileName.substring(extensionIndex);
            }
        }

        return documentType.name().toLowerCase() + "-" + UUID.randomUUID() + extension;
    }

    private Application createApplicationForSubmission(User user) {
        Project project = projectRepository.findByStatus(com.caovinh.noxh.constant.ProjectStatus.OPEN).stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        return Application.builder()
                .user(user)
                .project(project)
                .status(ApplicationStatus.DRAFT)
                .province(user.getProvince())
                .district(user.getDistrict())
                .ward(user.getWard())
                .detailedAddress(
                        user.getCurrentAddress() != null && !user.getCurrentAddress().isBlank()
                                ? user.getCurrentAddress()
                                : user.getPermanentAddress())
                .householdSize(user.getHouseholdSize())
                .priorityCategory(user.getPriorityCategory())
                .incomePerMonth(user.getIncomePerMonth())
                .priorityScore(0)
                .build();
    }

    private void validateSubmissionAllowed(Application application) {
        if (application.getStatus() == null) {
            return;
        }

        switch (application.getStatus()) {
            case SUBMITTED, UNDER_REVIEW -> throw new AppException(ErrorCode.APPLICATION_RESUBMISSION_NOT_ALLOWED);
            case APPROVED, LOTTERY_QUALIFIED -> throw new AppException(ErrorCode.APPLICATION_ALREADY_APPROVED);
            default -> {
            }
        }
    }
}
