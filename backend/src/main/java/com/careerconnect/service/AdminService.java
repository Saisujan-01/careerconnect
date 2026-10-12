package com.careerconnect.service;

import com.careerconnect.dto.AdminDTO;
import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.entity.*;
import com.careerconnect.exception.BadRequestException;
import com.careerconnect.exception.ResourceNotFoundException;
import com.careerconnect.repository.*;
import com.careerconnect.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogRepository auditLogRepository;
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public AdminDTO.AdminDashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long totalCandidates = userRepository.countByRole(Role.CANDIDATE);
        long totalRecruiters = userRepository.countByRole(Role.RECRUITER);
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus(JobStatus.PUBLISHED);
        long totalApps = jobApplicationRepository.count();
        long totalCompanies = companyRepository.count();

        // Application status distribution
        Map<String, Long> statusMap = new HashMap<>();
        for (ApplicationStatus st : ApplicationStatus.values()) {
            statusMap.put(st.name(), 0L);
        }
        for (ApplicationStatus st : ApplicationStatus.values()) {
            // Count overall
            long count = jobApplicationRepository.findAll().stream()
                    .filter(a -> a.getStatus() == st)
                    .count();
            statusMap.put(st.name(), count);
        }

        // Recent audit logs
        Page<AuditLog> auditPage = auditLogRepository.findAll(PageRequest.of(0, 10));
        List<AdminDTO.AuditLogResponse> logs = auditPage.getContent().stream()
                .map(this::mapToAuditLogResponse)
                .collect(Collectors.toList());

        return AdminDTO.AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalRecruiters(totalRecruiters)
                .totalJobs(totalJobs)
                .totalActiveJobs(activeJobs)
                .totalApplications(totalApps)
                .totalCompanies(totalCompanies)
                .applicationsByStatus(statusMap)
                .recentAuditLogs(logs)
                .build();
    }

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<AdminDTO.UserDetailResponse> getUsers(Role role, String keyword, Pageable pageable) {
        Page<User> page = userRepository.searchUsers(role, (keyword != null && !keyword.isBlank()) ? keyword.trim() : null, pageable);

        List<AdminDTO.UserDetailResponse> responses = page.getContent().stream()
                .map(u -> {
                    long appCount = (u.getRole() == Role.CANDIDATE) ? jobApplicationRepository.countByCandidateId(u.getId()) : 0;
                    long jobCount = (u.getRole() == Role.RECRUITER) ? jobRepository.countByRecruiterId(u.getId()) : 0;
                    return AdminDTO.UserDetailResponse.builder()
                            .id(u.getId())
                            .email(u.getEmail())
                            .fullName(u.getFullName())
                            .role(u.getRole())
                            .isActive(u.getIsActive())
                            .createdAt(u.getCreatedAt())
                            .updatedAt(u.getUpdatedAt())
                            .applicationCount(appCount)
                            .jobPostingCount(jobCount)
                            .build();
                })
                .collect(Collectors.toList());

        return CommonDTO.PagedResponse.<AdminDTO.UserDetailResponse>builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    @Transactional
    public void updateUserStatus(Long userId, AdminDTO.UserStatusUpdateRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Safeguard: cannot deactivate self if admin
        if (targetUser.getId().equals(adminId)) {
            throw new BadRequestException("Administrators cannot deactivate their own account.");
        }

        targetUser.setIsActive(request.getIsActive());
        userRepository.save(targetUser);

        String action = Boolean.TRUE.equals(request.getIsActive()) ? "USER_ACTIVATE" : "USER_DEACTIVATE";
        auditLogService.log(admin, action, "USER", targetUser.getId(),
                "Changed status to " + request.getIsActive() + ". Reason: " + request.getReason(), null);
    }

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<JobDTO.JobResponse> getJobs(String keyword, JobStatus status, ModerationStatus moderationStatus, Pageable pageable) {
        Page<Job> page = jobRepository.searchAdminJobs(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                status,
                moderationStatus,
                pageable
        );

        List<JobDTO.JobResponse> list = page.getContent().stream()
                .map(j -> jobService.mapToJobResponse(j, false))
                .collect(Collectors.toList());

        return CommonDTO.PagedResponse.<JobDTO.JobResponse>builder()
                .content(list)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    @Transactional
    public JobDTO.JobResponse moderateJob(Long jobId, JobDTO.JobModerationRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        job.setModerationStatus(request.getModerationStatus());
        if (request.getModerationStatus() == ModerationStatus.REJECTED) {
            job.setStatus(JobStatus.CLOSED);
        }
        job = jobRepository.save(job);

        auditLogService.log(admin, "JOB_MODERATE", "JOB", job.getId(),
                "Set moderation status to " + request.getModerationStatus() + ". Notes: " + request.getModerationNotes(), null);

        return jobService.mapToJobResponse(job, false);
    }

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<AdminDTO.AuditLogResponse> getAuditLogs(String action, String entityType, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.searchLogs(
                (action != null && !action.isBlank()) ? action.trim() : null,
                (entityType != null && !entityType.isBlank()) ? entityType.trim() : null,
                pageable
        );

        List<AdminDTO.AuditLogResponse> responses = page.getContent().stream()
                .map(this::mapToAuditLogResponse)
                .collect(Collectors.toList());

        return CommonDTO.PagedResponse.<AdminDTO.AuditLogResponse>builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse> getAllApplications(Pageable pageable) {
        Page<JobApplication> page = jobApplicationRepository.findAllWithDetails(pageable);
        List<ApplicationDTO.ApplicationResponse> dtos = page.getContent().stream()
                .map(applicationService::mapToApplicationResponse)
                .collect(Collectors.toList());

        return CommonDTO.PagedResponse.<ApplicationDTO.ApplicationResponse>builder()
                .content(dtos)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    private AdminDTO.AuditLogResponse mapToAuditLogResponse(AuditLog log) {
        return AdminDTO.AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "SYSTEM")
                .userFullName(log.getUser() != null ? log.getUser().getFullName() : "System Process")
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
