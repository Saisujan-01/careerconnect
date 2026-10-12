package com.careerconnect.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class CandidateDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateProfileRequest {
        private String phone;
        private String location;
        private String headline;
        private String summary;
        private String skills;
        private String education;
        private String experience;
        private String linkedinUrl;
        private String portfolioUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateProfileResponse {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String location;
        private String headline;
        private String summary;
        private String skills;
        private String education;
        private String experience;
        private String linkedinUrl;
        private String portfolioUrl;
        private String resumeFilePath;
        private String resumeFileName;
        private int completionPercentage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateDashboardResponse {
        private CandidateProfileResponse profile;
        private int completionPercentage;
        private long totalApplications;
        private long pendingApplications;
        private long shortlistedApplications;
        private long selectedApplications;
        private long rejectedApplications;
        private long savedJobsCount;
        private List<ApplicationDTO.ApplicationResponse> recentApplications;
        private List<JobDTO.JobResponse> recommendedJobs;
    }
}
