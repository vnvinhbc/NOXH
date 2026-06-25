package com.caovinh.noxh.service.admin;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ApartmentImportParserTest {

    ApartmentImportParser parser = new ApartmentImportParser();

    @Test
    void parseCsv_validRows_returnsTypedRows() {
        String csv = """
                apartment_code,building,block_name,floor,unit_number,area_sqm,bedroom_count,direction,price_per_sqm,total_price,status
                A-0101,A,Block A,1,0101,50.5,2,Dong Nam,16000000,808000000,AVAILABLE
                """;
        MockMultipartFile file = new MockMultipartFile(
                "file", "apartments.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        var result = parser.parse(file);

        assertThat(result.errors()).isEmpty();
        assertThat(result.rows()).hasSize(1);
        assertThat(result.rows().get(0).rowNumber()).isEqualTo(2);
        assertThat(result.rows().get(0).request().getApartmentCode()).isEqualTo("A-0101");
        assertThat(result.rows().get(0).request().getAreaSqm()).isEqualByComparingTo("50.5");
    }

    @Test
    void parseCsv_invalidNumber_returnsRowAndFieldError() {
        String csv = """
                apartment_code,building,block_name,floor,unit_number,area_sqm,bedroom_count,direction,price_per_sqm,total_price,status
                A-0101,A,Block A,abc,0101,50.5,2,Dong Nam,16000000,808000000,AVAILABLE
                """;

        var result = parser.parse(new MockMultipartFile(
                "file", "apartments.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)));

        assertThat(result.rows()).isEmpty();
        assertThat(result.errors()).singleElement()
                .satisfies(error -> {
                    assertThat(error.getRow()).isEqualTo(2);
                    assertThat(error.getField()).isEqualTo("floor");
                });
    }

    @Test
    void parseXlsx_validRows_returnsTypedRows() throws Exception {
        byte[] workbookBytes;
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("apartments");
            var header = sheet.createRow(0);
            String[] columns = ApartmentImportParser.COLUMNS;
            for (int index = 0; index < columns.length; index++) header.createCell(index).setCellValue(columns[index]);
            var row = sheet.createRow(1);
            Object[] values = {"A-0102", "A", "Block A", 1, "0102", 55.0, 2, "Tay Bac", 16_000_000, 880_000_000, "AVAILABLE"};
            for (int index = 0; index < values.length; index++) {
                if (values[index] instanceof Number number) row.createCell(index).setCellValue(number.doubleValue());
                else row.createCell(index).setCellValue(String.valueOf(values[index]));
            }
            workbook.write(output);
            workbookBytes = output.toByteArray();
        }

        var result = parser.parse(new MockMultipartFile(
                "file", "apartments.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                workbookBytes));

        assertThat(result.errors()).isEmpty();
        assertThat(result.rows()).hasSize(1);
        assertThat(result.rows().get(0).request().getApartmentCode()).isEqualTo("A-0102");
    }
}
