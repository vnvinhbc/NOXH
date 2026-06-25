package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.dto.request.admin.AdminApartmentRequest;
import com.caovinh.noxh.dto.response.admin.AdminApartmentImportError;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class ApartmentImportParser {

    public static final String[] COLUMNS = {
            "apartment_code", "building", "block_name", "floor", "unit_number",
            "area_sqm", "bedroom_count", "direction", "price_per_sqm", "total_price", "status"
    };

    public ParseResult parse(MultipartFile file) {
        String fileName = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase(Locale.ROOT);
        try {
            if (fileName.endsWith(".csv")) return parseCsv(file);
            if (fileName.endsWith(".xlsx")) return parseXlsx(file);
            throw new AppException(ErrorCode.UNSUPPORTED_IMPORT_FILE);
        } catch (AppException exception) {
            throw exception;
        } catch (IOException | RuntimeException exception) {
            throw new AppException(ErrorCode.APARTMENT_IMPORT_INVALID, exception);
        }
    }

    private ParseResult parseCsv(MultipartFile file) throws IOException {
        List<ParsedRow> rows = new ArrayList<>();
        List<AdminApartmentImportError> errors = new ArrayList<>();
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true)
                .get();
        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            Iterable<CSVRecord> records = format.parse(reader);
            for (CSVRecord record : records) {
                int rowNumber = Math.toIntExact(record.getRecordNumber() + 1);
                Map<String, String> values = new LinkedHashMap<>();
                for (String column : COLUMNS) values.put(column, record.isMapped(column) ? record.get(column) : "");
                parseRow(rowNumber, values, rows, errors);
            }
        }
        return new ParseResult(rows, errors);
    }

    private ParseResult parseXlsx(MultipartFile file) throws IOException {
        List<ParsedRow> rows = new ArrayList<>();
        List<AdminApartmentImportError> errors = new ArrayList<>();
        DataFormatter formatter = new DataFormatter(Locale.ROOT);
        try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
            var sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            if (header == null) {
                return new ParseResult(List.of(), List.of(error(1, "header", "Missing header row")));
            }
            Map<String, Integer> indexes = new HashMap<>();
            for (int index = 0; index < header.getLastCellNum(); index++) {
                indexes.put(formatter.formatCellValue(header.getCell(index)).trim(), index);
            }
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;
                Map<String, String> values = new LinkedHashMap<>();
                boolean hasValue = false;
                for (String column : COLUMNS) {
                    Integer index = indexes.get(column);
                    String value = index == null ? "" : formatter.formatCellValue(row.getCell(index)).trim();
                    values.put(column, value);
                    hasValue |= !value.isBlank();
                }
                if (hasValue) parseRow(rowIndex + 1, values, rows, errors);
            }
        }
        return new ParseResult(rows, errors);
    }

    private void parseRow(
            int rowNumber,
            Map<String, String> values,
            List<ParsedRow> rows,
            List<AdminApartmentImportError> errors
    ) {
        try {
            String code = required(values, rowNumber, "apartment_code");
            BigDecimal area = decimal(required(values, rowNumber, "area_sqm"), rowNumber, "area_sqm");
            Long pricePerSqm = longValue(required(values, rowNumber, "price_per_sqm"), rowNumber, "price_per_sqm");
            ApartmentUnitStatus status = status(required(values, rowNumber, "status"), rowNumber);
            if (status != ApartmentUnitStatus.AVAILABLE && status != ApartmentUnitStatus.UNAVAILABLE) {
                throw new RowException(rowNumber, "status", "Status must be AVAILABLE or UNAVAILABLE");
            }
            AdminApartmentRequest request = AdminApartmentRequest.builder()
                    .apartmentCode(code)
                    .building(blankToNull(values.get("building")))
                    .blockName(blankToNull(values.get("block_name")))
                    .floor(integer(values.get("floor"), rowNumber, "floor"))
                    .unitNumber(blankToNull(values.get("unit_number")))
                    .areaSqm(area)
                    .bedroomCount(integer(values.get("bedroom_count"), rowNumber, "bedroom_count"))
                    .direction(blankToNull(values.get("direction")))
                    .pricePerSqm(pricePerSqm)
                    .totalPrice(nullableLong(values.get("total_price"), rowNumber, "total_price"))
                    .status(status)
                    .build();
            rows.add(new ParsedRow(rowNumber, request));
        } catch (RowException exception) {
            errors.add(error(exception.row, exception.field, exception.getMessage()));
        }
    }

    private String required(Map<String, String> values, int row, String field) {
        String value = values.getOrDefault(field, "").trim();
        if (value.isBlank()) throw new RowException(row, field, "Field is required");
        return value;
    }

    private Integer integer(String value, int row, String field) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value.trim()).intValueExact();
        } catch (ArithmeticException | NumberFormatException exception) {
            throw new RowException(row, field, "Invalid integer");
        }
    }

    private BigDecimal decimal(String value, int row, String field) {
        try {
            BigDecimal parsed = new BigDecimal(value.trim());
            if (parsed.signum() <= 0) throw new NumberFormatException();
            return parsed;
        } catch (NumberFormatException exception) {
            throw new RowException(row, field, "Invalid positive number");
        }
    }

    private Long longValue(String value, int row, String field) {
        Long parsed = nullableLong(value, row, field);
        if (parsed == null || parsed <= 0) throw new RowException(row, field, "Invalid positive integer");
        return parsed;
    }

    private Long nullableLong(String value, int row, String field) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value.trim()).longValueExact();
        } catch (ArithmeticException | NumberFormatException exception) {
            throw new RowException(row, field, "Invalid integer");
        }
    }

    private ApartmentUnitStatus status(String value, int row) {
        try {
            return ApartmentUnitStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new RowException(row, "status", "Invalid status");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AdminApartmentImportError error(int row, String field, String message) {
        return AdminApartmentImportError.builder().row(row).field(field).message(message).build();
    }

    public record ParsedRow(int rowNumber, AdminApartmentRequest request) {}
    public record ParseResult(List<ParsedRow> rows, List<AdminApartmentImportError> errors) {}

    private static class RowException extends RuntimeException {
        final int row;
        final String field;

        RowException(int row, String field, String message) {
            super(message);
            this.row = row;
            this.field = field;
        }
    }
}
