package com.careerconnect.dto;

import com.careerconnect.entity.ApplicationStatus;
import com.careerconnect.entity.EmploymentType;
import com.careerconnect.entity.WorkplaceType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ApplicationDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationCreateRequest {
        private String coverLetter;
        private String resumeFilePath;
        private String resumeFileName;
        @Builder.Default
        private Boolean useSavedResume = false;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationStatusUpdateRequest {
        @NotNull(message = "New application status is required")
        private ApplicationStatus status;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private String companyLogoUrl;
        private String jobLocation;
        private WorkplaceType workplaceType;
        private EmploymentType employmentType;

        private Long candidateId;
        private String candidateName;
        private String candidateEmail;
        private String candidatePhone;
        private String candidateLocation;
        private String candidateHeadline;
        private String candidateSkills;

        private String coverLetter;
        private String resumeFilePath;
        private String resumeFileName;
        private ApplicationStatus status;
        private String statusNotes;
        private LocalDateTime appliedAt;
        private LocalDateTime updatedAt;

        private List<ApplicationStatusHistoryResponse> statusHistory;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationStatusHistoryResponse {
        private Long id;
        private String previousStatus;
        private String newStatus;
        private Long changedByUserId;
        private String changedByName;
        private String notes;
        private LocalDateTime createdAt;
    }
}
