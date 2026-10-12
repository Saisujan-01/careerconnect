package com.careerconnect.exception;

import com.careerconnect.dto.CommonDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.add(fieldError.getField() + ": " + fieldError.getDefaultMessage());
        }
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message("Validation failed. Please correct the invalid fields.")
                .errors(errors)
                .status(HttpStatus.BAD_REQUEST.value())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .status(HttpStatus.NOT_FOUND.value())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleBadRequest(BadRequestException ex) {
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message("Invalid email or password.")
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<CommonDTO.ErrorResponse> handleForbidden(Exception ex) {
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message("You do not have permission to perform this action.")
                .status(HttpStatus.FORBIDDEN.value())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleMaxSize(MaxUploadSizeExceededException ex) {
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message("Uploaded file exceeds the maximum allowed size (10 MB).")
                .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .build();
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonDTO.ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled server exception: ", ex);
        CommonDTO.ErrorResponse response = CommonDTO.ErrorResponse.builder()
                .success(false)
                .message("An unexpected error occurred. Please try again later.")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
