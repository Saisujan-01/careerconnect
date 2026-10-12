package com.careerconnect.controller;

import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.entity.EmploymentType;
import com.careerconnect.entity.JobStatus;
import com.careerconnect.entity.WorkplaceType;
import com.careerconnect.service.ApplicationService;
import com.careerconnect.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Endpoints for searching, viewing, creating, and managing job postings")
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @GetMapping
    @Operation(summary = "Search and filter public job postings")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<JobDTO.JobResponse>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) WorkplaceType workplaceType,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        CommonDTO.PagedResponse<JobDTO.JobResponse> result = jobService.searchPublicJobs(
                keyword, location, category, workplaceType, employmentType, minSalary, maxSalary, sortBy, page, size
        );
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(result));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured job postings for landing page")
    public ResponseEntity<CommonDTO.ApiResponse<List<JobDTO.JobResponse>>> getFeaturedJobs() {
        List<JobDTO.JobResponse> featured = jobService.getFeaturedJobs();
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(featured));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get popular job categories")
    public ResponseEntity<CommonDTO.ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(jobService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information for a single job posting")
    public ResponseEntity<CommonDTO.ApiResponse<JobDTO.JobResponse>> getJobById(@PathVariable Long id) {
        JobDTO.JobResponse job = jobService.getJobById(id);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(job));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related jobs in the same category")
    public ResponseEntity<CommonDTO.ApiResponse<List<JobDTO.JobResponse>>> getRelatedJobs(@PathVariable Long id) {
        List<JobDTO.JobResponse> related = jobService.getRelatedJobs(id);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(related));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Create a new job posting")
    public ResponseEntity<CommonDTO.ApiResponse<JobDTO.JobResponse>> createJob(@Valid @RequestBody JobDTO.JobRequest request) {
        JobDTO.JobResponse created = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonDTO.ApiResponse.ok("Job posted successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update an existing job posting")
    public ResponseEntity<CommonDTO.ApiResponse<JobDTO.JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobDTO.JobRequest request
    ) {
        JobDTO.JobResponse updated = jobService.updateJob(id, request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Job updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update job status (e.g. PUBLISHED, CLOSED)")
    public ResponseEntity<CommonDTO.ApiResponse<JobDTO.JobResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody
    ) {
        String statusStr = statusBody.get("status");
        JobStatus status = JobStatus.valueOf(statusStr.toUpperCase());
        JobDTO.JobResponse updated = jobService.updateJobStatus(id, status);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Job status changed to " + status, updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Delete or archive a job posting")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Job removed or archived successfully", null));
    }

    @PostMapping("/{id}/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Apply for a job posting")
    public ResponseEntity<CommonDTO.ApiResponse<ApplicationDTO.ApplicationResponse>> applyForJob(
            @PathVariable Long id,
            @RequestBody ApplicationDTO.ApplicationCreateRequest request
    ) {
        ApplicationDTO.ApplicationResponse app = applicationService.applyForJob(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonDTO.ApiResponse.ok("Application submitted successfully!", app));
    }

    @GetMapping("/{id}/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get applicants for a specific job posting")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse>>> getJobApplicants(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse> applicants = applicationService.getApplicationsForJob(id, pageable);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(applicants));
    }
}
