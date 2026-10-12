package com.careerconnect.controller;

import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CandidateDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.service.ApplicationService;
import com.careerconnect.service.CandidateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@Tag(name = "Candidate", description = "Endpoints for candidate profile, dashboard, applications, and saved jobs")
public class CandidateController {

    private final CandidateService candidateService;
    private final ApplicationService applicationService;

    @GetMapping("/profile")
    @Operation(summary = "Get candidate profile details")
    public ResponseEntity<CommonDTO.ApiResponse<CandidateDTO.CandidateProfileResponse>> getProfile() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(candidateService.getProfile()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update candidate profile")
    public ResponseEntity<CommonDTO.ApiResponse<CandidateDTO.CandidateProfileResponse>> updateProfile(
            @Valid @RequestBody CandidateDTO.CandidateProfileRequest request
    ) {
        CandidateDTO.CandidateProfileResponse response = candidateService.updateProfile(request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Profile updated successfully", response));
    }

    @PostMapping("/resume")
    @Operation(summary = "Upload candidate resume document (PDF or DOCX)")
    public ResponseEntity<CommonDTO.ApiResponse<CandidateDTO.CandidateProfileResponse>> uploadResume(
            @RequestParam("file") MultipartFile file
    ) {
        CandidateDTO.CandidateProfileResponse response = candidateService.uploadResume(file);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Resume uploaded successfully", response));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get candidate dashboard summary with real DB statistics and job recommendations")
    public ResponseEntity<CommonDTO.ApiResponse<CandidateDTO.CandidateDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(candidateService.getDashboard()));
    }

    @GetMapping("/applications")
    @Operation(summary = "Get applications submitted by current candidate")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse>>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(applicationService.getCandidateApplications(pageable)));
    }

    @PostMapping("/applications/{id}/withdraw")
    @Operation(summary = "Withdraw an application before it progresses to advanced rounds")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> withdrawApplication(@PathVariable Long id) {
        applicationService.withdrawApplication(id);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Application successfully withdrawn", null));
    }

    @GetMapping("/saved-jobs")
    @Operation(summary = "Get jobs bookmarked/saved by candidate")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<JobDTO.JobResponse>>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(candidateService.getSavedJobs(pageable)));
    }

    @PostMapping("/saved-jobs/{jobId}")
    @Operation(summary = "Bookmark a job")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> saveJob(@PathVariable Long jobId) {
        candidateService.saveJob(jobId);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Job saved successfully", null));
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    @Operation(summary = "Remove bookmark for a job")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> unsaveJob(@PathVariable Long jobId) {
        candidateService.unsaveJob(jobId);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Job removed from saved list", null));
    }
}
