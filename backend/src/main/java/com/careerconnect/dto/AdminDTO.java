package com.careerconnect.dto;

import com.careerconnect.entity.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboardResponse {
        private long totalUsers;
        private long totalCandidates;
        private long totalRecruiters;
        private long totalJobs;
        private long totalActiveJobs;
        private long totalApplications;
        private long totalCompanies;
        private Map<String, Long> applicationsByStatus;
        private List<AuditLogResponse> recentAuditLogs;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStatusUpdateRequest {
        private Boolean isActive;
        private String reason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDetailResponse {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private long applicationCount;
        private long jobPostingCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuditLogResponse {
        private Long id;
        private Long userId;
        private String userEmail;
        private String userFullName;
        private String action;
        private String entityType;
        private Long entityId;
        private String details;
        private String ipAddress;
        private LocalDateTime createdAt;
    }
}
