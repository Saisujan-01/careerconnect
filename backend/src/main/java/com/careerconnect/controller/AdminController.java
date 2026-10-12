package com.careerconnect.controller;

import com.careerconnect.dto.AdminDTO;
import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.entity.JobStatus;
import com.careerconnect.entity.ModerationStatus;
import com.careerconnect.entity.Role;
import com.careerconnect.service.AdminService;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Endpoints for administrator oversight, user moderation, job approval, and audit logs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get overall platform statistics, user counts, and system metrics")
    public ResponseEntity<CommonDTO.ApiResponse<AdminDTO.AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(adminService.getDashboard()));
    }

    @GetMapping("/users")
    @Operation(summary = "Search and paginate platform users")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<AdminDTO.UserDetailResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(adminService.getUsers(role, keyword, pageable)));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminDTO.UserStatusUpdateRequest request
    ) {
        adminService.updateUserStatus(id, request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("User status updated successfully", null));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Search and moderate all job postings")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<JobDTO.JobResponse>>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) ModerationStatus moderationStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(adminService.getJobs(keyword, status, moderationStatus, pageable)));
    }

    @PatchMapping("/jobs/{id}/moderation")
    @Operation(summary = "Approve or reject a job posting")
    public ResponseEntity<CommonDTO.ApiResponse<JobDTO.JobResponse>> moderateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobDTO.JobModerationRequest request
    ) {
        JobDTO.JobResponse response = adminService.moderateJob(id, request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Job moderation status updated", response));
    }

    @GetMapping("/applications")
    @Operation(summary = "View all application activity across the platform")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse>>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(adminService.getAllApplications(pageable)));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Search and review platform administrative audit logs")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<AdminDTO.AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(adminService.getAuditLogs(action, entityType, pageable)));
    }
}
