package com.careerconnect.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class RecruiterDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruiterProfileRequest {
        private String phone;
        private String title;
        private String department;
        private String companyName;
        private String companyDescription;
        private String companyWebsite;
        private String companyIndustry;
        private String companyLocation;
        private String companyLogoUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruiterProfileResponse {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String title;
        private String department;
        private JobDTO.CompanySummary company;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruiterDashboardResponse {
        private long totalJobs;
        private long totalActiveJobs;
        private long totalApplicationsReceived;
        private long jobsNearingDeadline;
        private Map<String, Long> applicationsByStatus;
        private List<MonthlyApplicationCount> monthlyApplications;
        private List<ApplicationDTO.ApplicationResponse> recentApplicants;
        private List<JobDTO.JobResponse> activeJobListings;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyApplicationCount {
        private String month;
        private long count;
    }
}
