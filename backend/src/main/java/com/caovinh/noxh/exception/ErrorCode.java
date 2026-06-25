package com.caovinh.noxh.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User already existed", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1003, "Invalid email format", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1008, "Invalid credentials", HttpStatus.UNAUTHORIZED),
    OTP_INVALID(1009, "OTP is invalid or expired", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1010, "OTP has expired", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_FOUND(1011, "Email not found", HttpStatus.NOT_FOUND),
    PROJECT_NOT_FOUND(1012, "Project not found", HttpStatus.NOT_FOUND),
    APPLICATION_EXISTED(1013, "Application already existed for this project", HttpStatus.BAD_REQUEST),
    APPLICATION_NOT_FOUND(1014, "Application not found", HttpStatus.NOT_FOUND),
    INVALID_TOKEN(1015, "Invalid token", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1016, "Token has expired", HttpStatus.UNAUTHORIZED),
    FIELD_REQUIRED(1017, "Field is required", HttpStatus.BAD_REQUEST),
    INVALID_FORMAT(1018, "Invalid format", HttpStatus.BAD_REQUEST),
    PHONE_EXISTED(1019, "Phone number already existed", HttpStatus.BAD_REQUEST),
    CCCD_EXISTED(1020, "CCCD number already existed", HttpStatus.BAD_REQUEST),
    PROVINCE_NOT_FOUND(1021, "Province not found", HttpStatus.NOT_FOUND),
    DISTRICT_NOT_FOUND(1022, "District not found", HttpStatus.NOT_FOUND),
    IMAGE_UPLOAD_FAILED(1023, "Image upload failed", HttpStatus.BAD_GATEWAY),
    KYC_NOT_VERIFIED(1024, "KYC is not verified", HttpStatus.BAD_REQUEST),
    REQUIRED_DOCUMENTS_MISSING(1025, "Required documents are missing", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(1026, "Uploaded file is too large", HttpStatus.PAYLOAD_TOO_LARGE),
    ADMIN_ACCESS_REQUIRED(1027, "Admin access required", HttpStatus.FORBIDDEN),
    APPLICATION_RESUBMISSION_NOT_ALLOWED(1028, "Application is already being reviewed", HttpStatus.BAD_REQUEST),
    APPLICATION_ALREADY_APPROVED(1029, "Application has already been approved", HttpStatus.BAD_REQUEST),
    REJECTION_REASON_REQUIRED(1030, "Rejection reason is required", HttpStatus.BAD_REQUEST),
    LOTTERY_EVENT_NOT_FOUND(1031, "Lottery event not found", HttpStatus.NOT_FOUND),
    LOTTERY_EVENT_INVALID_STATUS(1032, "Lottery event status is invalid for this action", HttpStatus.BAD_REQUEST),
    LOTTERY_PARTICIPANTS_EMPTY(1033, "No approved applications found for lottery", HttpStatus.BAD_REQUEST),
    LOTTERY_APARTMENTS_EMPTY(1034, "No available apartments found for lottery", HttpStatus.BAD_REQUEST),
    LOTTERY_APARTMENTS_NOT_ENOUGH_FOR_PRIORITY(1035, "Available apartments are not enough for priority pool", HttpStatus.BAD_REQUEST),
    LOTTERY_JOB_ALREADY_EXISTS(1036, "Lottery job already exists for this event", HttpStatus.BAD_REQUEST),
    LOTTERY_RESULT_ALREADY_EXISTS(1037, "Lottery result already exists for this event", HttpStatus.BAD_REQUEST),
    LOTTERY_APPLICATION_ALREADY_PARTICIPATED(1038, "Some applications are already locked or already participated in another lottery event", HttpStatus.BAD_REQUEST),
    PROJECT_BUSINESS_ACTIVE(1039, "Project already has applications or lottery events and cannot be modified", HttpStatus.CONFLICT),
    APARTMENT_UNIT_NOT_FOUND(1040, "Apartment unit not found", HttpStatus.NOT_FOUND),
    APARTMENT_UNIT_LOCKED(1041, "Locked or assigned apartment unit cannot be modified", HttpStatus.CONFLICT),
    APARTMENT_CODE_EXISTED(1042, "Apartment code already exists in this project", HttpStatus.CONFLICT),
    APARTMENT_IMPORT_INVALID(1043, "Apartment import file is invalid", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_IMPORT_FILE(1044, "Only CSV and XLSX files are supported", HttpStatus.BAD_REQUEST),
    ;

    final int code;
    final String message;
    final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
