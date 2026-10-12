package com.careerconnect.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class CommonDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApiResponse<T> {
        @Builder.Default
        private boolean success = true;
        private String message;
        private T data;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();

        public static <T> ApiResponse<T> ok(T data) {
            return ApiResponse.<T>builder().success(true).data(data).build();
        }

        public static <T> ApiResponse<T> ok(String message, T data) {
            return ApiResponse.<T>builder().success(true).message(message).data(data).build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder().success(false).message(message).build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean isLast;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ErrorResponse {
        @Builder.Default
        private boolean success = false;
        private String message;
        private List<String> errors;
        private int status;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }
}
