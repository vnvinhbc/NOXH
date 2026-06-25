package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.dto.request.admin.AdminApartmentRequest;
import com.caovinh.noxh.dto.request.admin.AdminProjectRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.admin.*;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.service.admin.AdminProjectService;
import com.caovinh.noxh.service.admin.ApartmentImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/projects")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminProjectController {

    AdminProjectService adminProjectService;
    ApartmentImportService apartmentImportService;

    @GetMapping
    ApiResponse<List<AdminProjectResponse>> getProjects() {
        return ApiResponse.<List<AdminProjectResponse>>builder()
                .result(adminProjectService.getProjects())
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<AdminProjectResponse> createProject(
            @Valid @RequestPart("project") AdminProjectRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ApiResponse.<AdminProjectResponse>builder()
                .result(adminProjectService.createProject(request, image))
                .build();
    }

    @PutMapping(value = "/{projectId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<AdminProjectResponse> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestPart("project") AdminProjectRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ApiResponse.<AdminProjectResponse>builder()
                .result(adminProjectService.updateProject(projectId, request, image))
                .build();
    }

    @DeleteMapping("/{projectId}")
    ResponseEntity<Void> deleteProject(@PathVariable UUID projectId) {
        adminProjectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{projectId}/apartments")
    ApiResponse<List<ApartmentUnitResponse>> getApartments(@PathVariable UUID projectId) {
        return ApiResponse.<List<ApartmentUnitResponse>>builder()
                .result(adminProjectService.getApartments(projectId))
                .build();
    }

    @PostMapping("/{projectId}/apartments")
    ApiResponse<ApartmentUnitResponse> createApartment(
            @PathVariable UUID projectId,
            @Valid @RequestBody AdminApartmentRequest request
    ) {
        return ApiResponse.<ApartmentUnitResponse>builder()
                .result(adminProjectService.createApartment(projectId, request))
                .build();
    }

    @PutMapping("/{projectId}/apartments/{apartmentId}")
    ApiResponse<ApartmentUnitResponse> updateApartment(
            @PathVariable UUID projectId,
            @PathVariable UUID apartmentId,
            @Valid @RequestBody AdminApartmentRequest request
    ) {
        return ApiResponse.<ApartmentUnitResponse>builder()
                .result(adminProjectService.updateApartment(projectId, apartmentId, request))
                .build();
    }

    @DeleteMapping("/{projectId}/apartments/{apartmentId}")
    ResponseEntity<Void> deleteApartment(@PathVariable UUID projectId, @PathVariable UUID apartmentId) {
        adminProjectService.deleteApartment(projectId, apartmentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{projectId}/apartments/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<AdminApartmentImportResponse> importApartments(
            @PathVariable UUID projectId,
            @RequestPart("file") MultipartFile file
    ) {
        return ApiResponse.<AdminApartmentImportResponse>builder()
                .result(apartmentImportService.importApartments(projectId, file))
                .build();
    }

    @PostMapping(value = "/{projectId}/apartments/import-preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<AdminApartmentImportPreviewResponse> previewApartments(
            @PathVariable UUID projectId,
            @RequestPart("file") MultipartFile file
    ) {
        return ApiResponse.<AdminApartmentImportPreviewResponse>builder()
                .result(apartmentImportService.previewApartments(projectId, file))
                .build();
    }

    @GetMapping("/{projectId}/imports")
    ApiResponse<List<AdminApartmentImportHistoryResponse>> getImportHistory(@PathVariable UUID projectId) {
        return ApiResponse.<List<AdminApartmentImportHistoryResponse>>builder()
                .result(adminProjectService.getImportHistory(projectId))
                .build();
    }

    @GetMapping("/apartments/template.csv")
    ResponseEntity<byte[]> csvTemplate() {
        return templateResponse(
                apartmentImportService.csvTemplate(),
                "text/csv; charset=UTF-8",
                "apartment-import-template.csv");
    }

    @GetMapping("/apartments/template.xlsx")
    ResponseEntity<byte[]> xlsxTemplate() {
        return templateResponse(
                apartmentImportService.xlsxTemplate(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "apartment-import-template.xlsx");
    }

    private ResponseEntity<byte[]> templateResponse(byte[] content, String contentType, String fileName) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(content);
    }
}
