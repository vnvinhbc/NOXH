package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.request.admin.AdminApartmentRequest;
import com.caovinh.noxh.dto.request.admin.AdminProjectRequest;
import com.caovinh.noxh.dto.response.FileUploadResponse;
import com.caovinh.noxh.dto.response.admin.AdminApartmentImportHistoryResponse;
import com.caovinh.noxh.dto.response.admin.AdminProjectResponse;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.entity.ApartmentUnit;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.repository.*;
import com.caovinh.noxh.service.ImageKitService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminProjectService {

    ProjectRepository projectRepository;
    ApplicationRepository applicationRepository;
    LotteryEventRepository lotteryEventRepository;
    ApartmentUnitRepository apartmentUnitRepository;
    ApartmentImportHistoryRepository apartmentImportHistoryRepository;
    ImageKitService imageKitService;

    @Transactional(readOnly = true)
    public List<AdminProjectResponse> getProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toProjectResponse)
                .toList();
    }

    @Transactional
    public AdminProjectResponse createProject(AdminProjectRequest request, MultipartFile image) {
        validateProjectDates(request);
        Project project = new Project();
        applyProjectRequest(project, request);
        if (image != null && !image.isEmpty()) {
            FileUploadResponse uploaded = imageKitService.upload(image, "project-" + UUID.randomUUID() + fileExtension(image));
            project.setImageUrl(uploaded.getUrl());
        }
        project.setTotalUnits(0);
        project.setAvailableUnits(0);
        return toProjectResponse(projectRepository.save(project));
    }

    @Transactional
    public AdminProjectResponse updateProject(UUID projectId, AdminProjectRequest request, MultipartFile image) {
        Project project = requireProject(projectId);
        requireMutableProject(projectId);
        validateProjectDates(request);
        applyProjectRequest(project, request);
        if (image != null && !image.isEmpty()) {
            FileUploadResponse uploaded = imageKitService.upload(image, "project-" + projectId + fileExtension(image));
            project.setImageUrl(uploaded.getUrl());
        }
        return toProjectResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(UUID projectId) {
        Project project = requireProject(projectId);
        requireMutableProject(projectId);
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<ApartmentUnitResponse> getApartments(UUID projectId) {
        requireProject(projectId);
        return apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId).stream()
                .map(this::toApartmentResponse)
                .toList();
    }

    @Transactional
    public ApartmentUnitResponse createApartment(UUID projectId, AdminApartmentRequest request) {
        Project project = requireProject(projectId);
        requireMutableProject(projectId);
        validateApartmentStatus(request);
        if (apartmentUnitRepository.existsByProjectIdAndApartmentCodeIgnoreCase(projectId, request.getApartmentCode().trim())) {
            throw new AppException(ErrorCode.APARTMENT_CODE_EXISTED);
        }

        ApartmentUnit apartment = ApartmentUnit.builder().project(project).build();
        applyApartmentRequest(apartment, request);
        ApartmentUnit saved = apartmentUnitRepository.save(apartment);
        recalculateProject(project);
        return toApartmentResponse(saved);
    }

    @Transactional
    public ApartmentUnitResponse updateApartment(UUID projectId, UUID apartmentId, AdminApartmentRequest request) {
        Project project = requireProject(projectId);
        requireMutableProject(projectId);
        validateApartmentStatus(request);
        ApartmentUnit apartment = requireApartment(projectId, apartmentId);
        requireMutableApartment(apartment);
        String requestedCode = request.getApartmentCode().trim();
        if (!apartment.getApartmentCode().equalsIgnoreCase(requestedCode)
                && apartmentUnitRepository.existsByProjectIdAndApartmentCodeIgnoreCase(projectId, requestedCode)) {
            throw new AppException(ErrorCode.APARTMENT_CODE_EXISTED);
        }
        applyApartmentRequest(apartment, request);
        ApartmentUnit saved = apartmentUnitRepository.save(apartment);
        recalculateProject(project);
        return toApartmentResponse(saved);
    }

    @Transactional
    public void deleteApartment(UUID projectId, UUID apartmentId) {
        Project project = requireProject(projectId);
        requireMutableProject(projectId);
        ApartmentUnit apartment = requireApartment(projectId, apartmentId);
        requireMutableApartment(apartment);
        apartmentUnitRepository.delete(apartment);
        apartmentUnitRepository.flush();
        recalculateProject(project);
    }

    @Transactional(readOnly = true)
    public List<AdminApartmentImportHistoryResponse> getImportHistory(UUID projectId) {
        requireProject(projectId);
        return apartmentImportHistoryRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(item -> AdminApartmentImportHistoryResponse.builder()
                        .id(item.getId().toString())
                        .originalFileName(item.getOriginalFileName())
                        .fileUrl(item.getFileUrl())
                        .importedCount(item.getImportedCount())
                        .createdAt(item.getCreatedAt())
                        .build())
                .toList();
    }

    public Project requireProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
    }

    public void requireMutableProject(UUID projectId) {
        if (isBusinessActive(projectId)) {
            throw new AppException(ErrorCode.PROJECT_BUSINESS_ACTIVE);
        }
    }

    public void recalculateProject(Project project) {
        UUID projectId = project.getId();
        long total = apartmentUnitRepository.countByProjectId(projectId);
        long available = apartmentUnitRepository.countByProjectIdAndStatus(projectId, ApartmentUnitStatus.AVAILABLE);
        List<ApartmentUnit> apartments = apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId);
        project.setTotalUnits(Math.toIntExact(total));
        project.setAvailableUnits(Math.toIntExact(available));
        project.setMinArea(apartments.stream().map(ApartmentUnit::getAreaSqm).filter(value -> value != null)
                .min(BigDecimal::compareTo).map(BigDecimal::doubleValue).orElse(null));
        project.setMaxArea(apartments.stream().map(ApartmentUnit::getAreaSqm).filter(value -> value != null)
                .max(BigDecimal::compareTo).map(BigDecimal::doubleValue).orElse(null));
        projectRepository.save(project);
    }

    private boolean isBusinessActive(UUID projectId) {
        return applicationRepository.existsByProjectId(projectId) || lotteryEventRepository.existsByProjectId(projectId);
    }

    private ApartmentUnit requireApartment(UUID projectId, UUID apartmentId) {
        ApartmentUnit apartment = apartmentUnitRepository.findById(apartmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APARTMENT_UNIT_NOT_FOUND));
        if (apartment.getProject() == null || !projectId.equals(apartment.getProject().getId())) {
            throw new AppException(ErrorCode.APARTMENT_UNIT_NOT_FOUND);
        }
        return apartment;
    }

    private void requireMutableApartment(ApartmentUnit apartment) {
        if (apartment.getStatus() == ApartmentUnitStatus.LOCKED
                || apartment.getStatus() == ApartmentUnitStatus.ASSIGNED
                || apartment.getLockedEvent() != null
                || apartment.getAssignedResult() != null) {
            throw new AppException(ErrorCode.APARTMENT_UNIT_LOCKED);
        }
    }

    private void validateProjectDates(AdminProjectRequest request) {
        if (request.getRegistrationStart() != null && request.getRegistrationEnd() != null
                && request.getRegistrationEnd().isBefore(request.getRegistrationStart())) {
            throw new AppException(ErrorCode.INVALID_FORMAT);
        }
    }

    private void validateApartmentStatus(AdminApartmentRequest request) {
        if (request.getStatus() != ApartmentUnitStatus.AVAILABLE
                && request.getStatus() != ApartmentUnitStatus.UNAVAILABLE) {
            throw new AppException(ErrorCode.INVALID_FORMAT);
        }
    }

    private void applyProjectRequest(Project project, AdminProjectRequest request) {
        project.setName(request.getName().trim());
        project.setDescription(request.getDescription());
        project.setLocation(request.getLocation());
        project.setProvince(request.getProvince());
        project.setPricePerSqm(request.getPricePerSqm());
        project.setRegistrationStart(request.getRegistrationStart());
        project.setRegistrationEnd(request.getRegistrationEnd());
        project.setLotteryDate(request.getLotteryDate());
        project.setStatus(request.getStatus());
    }

    private void applyApartmentRequest(ApartmentUnit apartment, AdminApartmentRequest request) {
        apartment.setApartmentCode(request.getApartmentCode().trim());
        apartment.setBuilding(request.getBuilding());
        apartment.setBlockName(request.getBlockName());
        apartment.setFloor(request.getFloor());
        apartment.setUnitNumber(request.getUnitNumber());
        apartment.setAreaSqm(request.getAreaSqm());
        apartment.setBedroomCount(request.getBedroomCount());
        apartment.setDirection(request.getDirection());
        apartment.setPricePerSqm(request.getPricePerSqm());
        apartment.setTotalPrice(request.getTotalPrice() != null
                ? request.getTotalPrice()
                : request.getAreaSqm().multiply(BigDecimal.valueOf(request.getPricePerSqm())).longValue());
        apartment.setStatus(request.getStatus());
    }

    private AdminProjectResponse toProjectResponse(Project project) {
        return AdminProjectResponse.builder()
                .id(project.getId().toString())
                .name(project.getName())
                .description(project.getDescription())
                .location(project.getLocation())
                .province(project.getProvince())
                .totalUnits(project.getTotalUnits())
                .availableUnits(project.getAvailableUnits())
                .pricePerSqm(project.getPricePerSqm())
                .minArea(project.getMinArea())
                .maxArea(project.getMaxArea())
                .registrationStart(project.getRegistrationStart())
                .registrationEnd(project.getRegistrationEnd())
                .lotteryDate(project.getLotteryDate())
                .status(project.getStatus().name())
                .imageUrl(project.getImageUrl())
                .businessActive(isBusinessActive(project.getId()))
                .createdAt(project.getCreatedAt())
                .build();
    }

    private ApartmentUnitResponse toApartmentResponse(ApartmentUnit apartment) {
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

    private String fileExtension(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null) return "";
        int index = name.lastIndexOf('.');
        return index >= 0 ? name.substring(index) : "";
    }
}
