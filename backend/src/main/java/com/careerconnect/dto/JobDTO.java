package com.careerconnect.dto;

import com.careerconnect.entity.EmploymentType;
import com.careerconnect.entity.JobStatus;
import com.careerconnect.entity.ModerationStatus;
import com.careerconnect.entity.WorkplaceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobRequest {
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Title cannot exceed 150 characters")
        private String title;

        private Long companyId;
        private String companyName; // Used if creating/assigning company on the fly

        @NotBlank(message = "Job description is required")
        private String description;

        private String responsibilities;
        private String skillsRequired;
        private String qualifications;

        @NotBlank(message = "Job category is required")
        private String category;

        @NotBlank(message = "Job location is required")
        private String location;

        @NotNull(message = "Workplace type is required")
        private WorkplaceType workplaceType;

        @NotNull(message = "Employment type is required")
        private EmploymentType employmentType;

        private String experienceLevel;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        @Builder.Default
        private String salaryCurrency = "USD";
        @Builder.Default
        private Boolean isSalaryNegotiable = false;

        private JobStatus status;
        private LocalDate applicationDeadline;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobResponse {
        private Long id;
        private String title;
        private CompanySummary company;
        private Long recruiterId;
        private String recruiterName;
        private String description;
        private String responsibilities;
        private String skillsRequired;
        private String qualifications;
        private String category;
        private String location;
        private WorkplaceType workplaceType;
        private EmploymentType employmentType;
        private String experienceLevel;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String salaryCurrency;
        private Boolean isSalaryNegotiable;
        private JobStatus status;
        private ModerationStatus moderationStatus;
        private LocalDate applicationDeadline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Dynamic fields based on caller
        private Boolean isSaved;
        private Boolean hasApplied;
        private Long applicantCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanySummary {
        private Long id;
        private String name;
        private String description;
        private String website;
        private String industry;
        private String location;
        private String logoUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobModerationRequest {
        @NotNull(message = "Moderation status is required")
        private ModerationStatus moderationStatus;
        private String moderationNotes;
    }
}
