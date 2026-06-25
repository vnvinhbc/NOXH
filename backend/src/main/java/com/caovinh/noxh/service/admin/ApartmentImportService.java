package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.dto.response.FileUploadResponse;
import com.caovinh.noxh.dto.response.admin.AdminApartmentImportError;
import com.caovinh.noxh.dto.response.admin.AdminApartmentImportPreviewResponse;
import com.caovinh.noxh.dto.response.admin.AdminApartmentImportPreviewRow;
import com.caovinh.noxh.dto.response.admin.AdminApartmentImportResponse;
import com.caovinh.noxh.entity.ApartmentImportHistory;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.repository.ApartmentImportHistoryRepository;
import com.caovinh.noxh.repository.ApartmentUnitRepository;
import com.caovinh.noxh.service.ImageKitService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ApartmentImportService {

    ApartmentImportParser parser;
    AdminProjectService adminProjectService;
    ApartmentImportPersistenceService persistenceService;
    ApartmentUnitRepository apartmentUnitRepository;
    ImageKitService imageKitService;
    ApartmentImportHistoryRepository historyRepository;

    public AdminApartmentImportPreviewResponse previewApartments(UUID projectId, MultipartFile file) {
        adminProjectService.requireProject(projectId);
        adminProjectService.requireMutableProject(projectId);
        ApartmentImportParser.ParseResult parsed = parser.parse(file);
        List<AdminApartmentImportError> errors = new ArrayList<>(parsed.errors());
        errors.addAll(validateDuplicates(projectId, parsed.rows()));
        if (parsed.rows().isEmpty() && errors.isEmpty()) {
            errors.add(error(1, "file", "Import file contains no apartment rows"));
        }
        return AdminApartmentImportPreviewResponse.builder()
                .valid(errors.isEmpty())
                .rows(parsed.rows().stream().map(this::toPreviewRow).toList())
                .errors(errors)
                .build();
    }

    public AdminApartmentImportResponse importApartments(UUID projectId, MultipartFile file) {
        Project project = adminProjectService.requireProject(projectId);
        adminProjectService.requireMutableProject(projectId);
        ApartmentImportParser.ParseResult parsed = parser.parse(file);
        List<AdminApartmentImportError> errors = new ArrayList<>(parsed.errors());
        errors.addAll(validateDuplicates(projectId, parsed.rows()));
        if (parsed.rows().isEmpty() && errors.isEmpty()) {
            errors.add(error(1, "file", "Import file contains no apartment rows"));
        }
        if (!errors.isEmpty()) {
            return AdminApartmentImportResponse.builder().success(false).errors(errors).build();
        }

        persistenceService.persist(project, parsed.rows());
        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("apartments");
        FileUploadResponse uploaded = imageKitService.upload(
                file,
                "apartment-import-" + projectId + "-" + System.currentTimeMillis() + extension(originalName));
        historyRepository.save(ApartmentImportHistory.builder()
                .project(project)
                .originalFileName(originalName)
                .fileUrl(uploaded.getUrl())
                .importedCount(parsed.rows().size())
                .build());

        return AdminApartmentImportResponse.builder()
                .success(true)
                .importedCount(parsed.rows().size())
                .fileUrl(uploaded.getUrl())
                .fileName(uploaded.getFileName())
                .build();
    }

    public byte[] csvTemplate() {
        String header = String.join(",", ApartmentImportParser.COLUMNS);
        String sample = "A-0101,A,Block A,1,0101,50.5,2,Dong Nam,16000000,808000000,AVAILABLE";
        return (header + "\n" + sample + "\n").getBytes(StandardCharsets.UTF_8);
    }

    public byte[] xlsxTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("apartments");
            var header = sheet.createRow(0);
            for (int index = 0; index < ApartmentImportParser.COLUMNS.length; index++) {
                header.createCell(index).setCellValue(ApartmentImportParser.COLUMNS[index]);
            }
            var sample = sheet.createRow(1);
            Object[] values = {"A-0101", "A", "Block A", 1, "0101", 50.5, 2, "Dong Nam", 16_000_000, 808_000_000, "AVAILABLE"};
            for (int index = 0; index < values.length; index++) {
                if (values[index] instanceof Number number) sample.createCell(index).setCellValue(number.doubleValue());
                else sample.createCell(index).setCellValue(String.valueOf(values[index]));
                sheet.autoSizeColumn(index);
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot generate XLSX template", exception);
        }
    }

    private List<AdminApartmentImportError> validateDuplicates(
            UUID projectId,
            List<ApartmentImportParser.ParsedRow> rows
    ) {
        List<AdminApartmentImportError> errors = new ArrayList<>();
        Map<String, List<ApartmentImportParser.ParsedRow>> rowsByCode = rows.stream()
                .collect(Collectors.groupingBy(
                        row -> row.request().getApartmentCode().trim().toLowerCase(Locale.ROOT),
                        LinkedHashMap::new,
                        Collectors.toList()));
        rowsByCode.values().stream()
                .filter(items -> items.size() > 1)
                .flatMap(Collection::stream)
                .forEach(row -> errors.add(error(row.rowNumber(), "apartment_code", "Duplicate apartment code in file")));

        Set<String> existingCodes = apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId).stream()
                .map(item -> item.getApartmentCode().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        rows.stream()
                .filter(row -> existingCodes.contains(row.request().getApartmentCode().trim().toLowerCase(Locale.ROOT)))
                .forEach(row -> errors.add(error(row.rowNumber(), "apartment_code", "Apartment code already exists in project")));
        return errors;
    }

    private AdminApartmentImportError error(int row, String field, String message) {
        return AdminApartmentImportError.builder().row(row).field(field).message(message).build();
    }

    private AdminApartmentImportPreviewRow toPreviewRow(ApartmentImportParser.ParsedRow row) {
        var request = row.request();
        Long totalPrice = request.getTotalPrice() != null
                ? request.getTotalPrice()
                : request.getAreaSqm().multiply(java.math.BigDecimal.valueOf(request.getPricePerSqm())).longValue();
        return AdminApartmentImportPreviewRow.builder()
                .row(row.rowNumber())
                .apartmentCode(request.getApartmentCode())
                .building(request.getBuilding())
                .blockName(request.getBlockName())
                .floor(request.getFloor())
                .unitNumber(request.getUnitNumber())
                .areaSqm(request.getAreaSqm())
                .bedroomCount(request.getBedroomCount())
                .direction(request.getDirection())
                .pricePerSqm(request.getPricePerSqm())
                .totalPrice(totalPrice)
                .status(request.getStatus().name())
                .build();
    }

    private String extension(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index) : "";
    }
}
