package com.civicissues.config;

import com.civicissues.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────
    // VALIDATION ERRORS
    // ─────────────────────────────────────────

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiResponse>
    handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getAllErrors()
                .forEach(error -> {
                    String fieldName =
                            ((FieldError) error).getField();
                    String errorMessage =
                            error.getDefaultMessage();
                    errors.put(fieldName, errorMessage);
                });

        ApiResponse response = new ApiResponse(
                false,
                "Validation failed. "
                        + "Please check the fields.",
                errors
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // ─────────────────────────────────────────
    // ACCESS DENIED
    // ─────────────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse>
    handleAccessDenied(
            AccessDeniedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        "Access denied. You do not have "
                                + "permission to access this resource."
                ));
    }

    // ─────────────────────────────────────────
    // BAD CREDENTIALS
    // ─────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse>
    handleBadCredentials(
            BadCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        "Invalid email or password."
                ));
    }

    // ─────────────────────────────────────────
    // FILE SIZE EXCEEDED
    // ─────────────────────────────────────────

    @ExceptionHandler(
            MaxUploadSizeExceededException.class
    )
    public ResponseEntity<ApiResponse>
    handleMaxUploadSize(
            MaxUploadSizeExceededException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        "File size exceeds the maximum "
                                + "allowed limit of 10MB."
                ));
    }

    // ─────────────────────────────────────────
    // NULL POINTER EXCEPTION
    // ─────────────────────────────────────────

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiResponse>
    handleNullPointer(
            NullPointerException ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "Something went wrong. "
                                + "Please try again."
                ));
    }

    // ─────────────────────────────────────────
    // ILLEGAL ARGUMENT EXCEPTION
    // ─────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse>
    handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    // ─────────────────────────────────────────
    // GENERAL EXCEPTION
    // ─────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse>
    handleGeneralException(Exception ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "An unexpected error occurred. "
                                + "Please try again later."
                ));
    }
}
