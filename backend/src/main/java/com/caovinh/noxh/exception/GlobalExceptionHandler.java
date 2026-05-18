package com.caovinh.noxh.exception;

import com.caovinh.noxh.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ErrorCode errorCode;
        try {
            errorCode = ErrorCode.valueOf(message);
        } catch (IllegalArgumentException ex) {
            errorCode = ErrorCode.INVALID_FORMAT;
        }

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException e) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.INVALID_FORMAT.getCode())
                        .message(e.getMessage())
                        .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException e) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleGeneral(Exception e) {
        log.error("Unhandled exception", e);
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }
}
