package com.careerconnect.controller;

import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.dto.RecruiterDTO;
import com.careerconnect.entity.ApplicationStatus;
import com.careerconnect.entity.JobStatus;
import com.careerconnect.service.ApplicationService;
import com.careerconnect.service.RecruiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECRUITER')")
@Tag(name = "Recruiter", description = "Endpoints for recruiter profile, dashboard, posted jobs, and applicant tracking")
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final ApplicationService applicationService;

    @GetMapping("/profile")
    @Operation(summary = "Get recruiter and company profile")
    public ResponseEntity<CommonDTO.ApiResponse<RecruiterDTO.RecruiterProfileResponse>> getProfile() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(recruiterService.getProfile()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update recruiter and company profile")
    public ResponseEntity<CommonDTO.ApiResponse<RecruiterDTO.RecruiterProfileResponse>> updateProfile(
            @Valid @RequestBody RecruiterDTO.RecruiterProfileRequest request
    ) {
        RecruiterDTO.RecruiterProfileResponse response = recruiterService.updateProfile(request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Profile updated successfully", response));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get recruiter dashboard metrics, application status chart, and upcoming deadlines")
    public ResponseEntity<CommonDTO.ApiResponse<RecruiterDTO.RecruiterDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(recruiterService.getDashboard()));
    }

    @GetMapping("/jobs")
    @Operation(summary = "List jobs posted by the authenticated recruiter")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<JobDTO.JobResponse>>> getMyJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(recruiterService.getMyJobs(status, pageable)));
    }

    @GetMapping("/applicants")
    @Operation(summary = "Search and filter applicants for recruiter's jobs")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse>>> searchApplicants(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(recruiterService.searchApplicants(jobId, status, keyword, pageable)));
    }

    @GetMapping("/applicants/{id}")
    @Operation(summary = "Get detailed applicant submission and candidate profile")
    public ResponseEntity<CommonDTO.ApiResponse<ApplicationDTO.ApplicationResponse>> getApplicantDetails(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(recruiterService.getApplicantDetails(id)));
    }

    @PatchMapping("/applicants/{id}/status")
    @Operation(summary = "Update application status (SHORTLISTED, REJECTED, SELECTED, UNDER_REVIEW)")
    public ResponseEntity<CommonDTO.ApiResponse<ApplicationDTO.ApplicationResponse>> updateApplicantStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDTO.ApplicationStatusUpdateRequest request
    ) {
        ApplicationDTO.ApplicationResponse response = applicationService.updateApplicationStatus(id, request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Application status updated to " + request.getStatus(), response));
    }
}
