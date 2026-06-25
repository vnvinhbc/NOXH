package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.request.admin.AdminApartmentRequest;
import com.caovinh.noxh.dto.response.FileUploadResponse;
import com.caovinh.noxh.entity.ApartmentUnit;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.repository.ApartmentImportHistoryRepository;
import com.caovinh.noxh.repository.ApartmentUnitRepository;
import com.caovinh.noxh.service.ImageKitService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApartmentImportServiceTest {

    @Mock ApartmentImportParser parser;
    @Mock AdminProjectService adminProjectService;
    @Mock ApartmentImportPersistenceService persistenceService;
    @Mock ApartmentUnitRepository apartmentUnitRepository;
    @Mock ImageKitService imageKitService;
    @Mock ApartmentImportHistoryRepository historyRepository;

    @Test
    void importApartments_duplicateCodeInFile_rejectsWholeBatch() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Draft").build();
        var row = row(2, "A-0101");
        MockMultipartFile file = new MockMultipartFile("file", "apartments.csv", "text/csv", new byte[]{1});
        when(adminProjectService.requireProject(projectId)).thenReturn(project);
        when(parser.parse(file)).thenReturn(new ApartmentImportParser.ParseResult(List.of(row, row(3, "a-0101")), List.of()));

        ApartmentImportService service = service();
        var result = service.importApartments(projectId, file);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrors()).extracting("field").contains("apartment_code");
        verifyNoInteractions(persistenceService, imageKitService);
    }

    @Test
    void importApartments_validBatch_persistsBeforeUploadingSourceFile() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Draft").build();
        var row = row(2, "A-0101");
        MockMultipartFile file = new MockMultipartFile("file", "apartments.csv", "text/csv", new byte[]{1});
        when(adminProjectService.requireProject(projectId)).thenReturn(project);
        when(parser.parse(file)).thenReturn(new ApartmentImportParser.ParseResult(List.of(row), List.of()));
        when(apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId)).thenReturn(List.of());
        when(imageKitService.upload(eq(file), any())).thenReturn(FileUploadResponse.builder()
                .url("https://ik.imagekit.io/noxh/apartments.csv")
                .fileName("apartments.csv")
                .build());

        ApartmentImportService service = service();
        var result = service.importApartments(projectId, file);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getImportedCount()).isEqualTo(1);
        InOrder order = inOrder(persistenceService, imageKitService);
        order.verify(persistenceService).persist(project, List.of(row));
        order.verify(imageKitService).upload(eq(file), any());
        verify(historyRepository).save(any());
    }

    @Test
    void previewApartments_validFile_returnsRowsWithoutPersistingOrUploading() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("Draft").build();
        var row = row(2, "A-0101");
        MockMultipartFile file = new MockMultipartFile("file", "apartments.csv", "text/csv", new byte[]{1});
        when(adminProjectService.requireProject(projectId)).thenReturn(project);
        when(parser.parse(file)).thenReturn(new ApartmentImportParser.ParseResult(List.of(row), List.of()));
        when(apartmentUnitRepository.findByProjectIdOrderByApartmentCodeAsc(projectId)).thenReturn(List.of());

        var result = service().previewApartments(projectId, file);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getRows()).singleElement()
                .satisfies(preview -> {
                    assertThat(preview.getRow()).isEqualTo(2);
                    assertThat(preview.getApartmentCode()).isEqualTo("A-0101");
                });
        verifyNoInteractions(persistenceService, imageKitService, historyRepository);
    }

    private ApartmentImportService service() {
        return new ApartmentImportService(
                parser,
                adminProjectService,
                persistenceService,
                apartmentUnitRepository,
                imageKitService,
                historyRepository);
    }

    private ApartmentImportParser.ParsedRow row(int rowNumber, String code) {
        return new ApartmentImportParser.ParsedRow(rowNumber, AdminApartmentRequest.builder()
                .apartmentCode(code)
                .areaSqm(new BigDecimal("50"))
                .pricePerSqm(16_000_000L)
                .status(ApartmentUnitStatus.AVAILABLE)
                .build());
    }
}
