package com.careerconnect.service;

import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.entity.*;
import com.careerconnect.exception.BadRequestException;
import com.careerconnect.exception.ForbiddenException;
import com.careerconnect.exception.ResourceNotFoundException;
import com.careerconnect.repository.*;
import com.careerconnect.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public ApplicationDTO.ApplicationResponse applyForJob(Long jobId, ApplicationDTO.ApplicationCreateRequest request) {
        Long candidateId = SecurityUtils.getCurrentUserId();
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate account not found"));

        if (candidate.getRole() != Role.CANDIDATE) {
            throw new ForbiddenException("Only candidates can submit job applications.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found with id: " + jobId));

        if (job.getStatus() != JobStatus.PUBLISHED || job.getModerationStatus() != ModerationStatus.APPROVED) {
            throw new BadRequestException("This job is not currently accepting applications.");
        }

        if (job.getApplicationDeadline() != null && LocalDate.now().isAfter(job.getApplicationDeadline())) {
            throw new BadRequestException("The application deadline for this job has expired.");
        }

        if (jobApplicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            throw new BadRequestException("You have already applied for this job.");
        }

        String resumePath = request.getResumeFilePath();
        String resumeName = request.getResumeFileName();

        if (Boolean.TRUE.equals(request.getUseSavedResume()) || (resumePath == null || resumePath.isBlank())) {
            CandidateProfile profile = candidateProfileRepository.findByUserId(candidateId).orElse(null);
            if (profile != null && profile.getResumeFilePath() != null) {
                resumePath = profile.getResumeFilePath();
                resumeName = profile.getResumeFileName();
            }
        }

        if (resumePath == null || resumePath.isBlank()) {
            throw new BadRequestException("Please attach or upload a resume to complete your application.");
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .candidate(candidate)
                .coverLetter(request.getCoverLetter())
                .resumeFilePath(resumePath)
                .resumeFileName(resumeName != null ? resumeName : "Resume.pdf")
                .status(ApplicationStatus.APPLIED)
                .statusNotes("Application submitted by candidate.")
                .build();

        application = jobApplicationRepository.save(application);

        // Record initial status history
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .previousStatus(null)
                .newStatus(ApplicationStatus.APPLIED.name())
                .changedBy(candidate)
                .notes("Application submitted successfully.")
                .build();
        statusHistoryRepository.save(history);

        auditLogService.log(candidate, "APPLICATION_SUBMIT", "APPLICATION", application.getId(), "Applied for job: " + job.getTitle(), null);

        return mapToApplicationResponse(application);
    }

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse> getCandidateApplications(Pageable pageable) {
        Long candidateId = SecurityUtils.getCurrentUserId();
        Page<JobApplication> page = jobApplicationRepository.findByCandidateIdWithDetails(candidateId, pageable);

        List<ApplicationDTO.ApplicationResponse> dtos = page.getContent().stream()
                .map(this::mapToApplicationResponse)
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

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<ApplicationDTO.ApplicationResponse> getApplicationsForJob(Long jobId, Pageable pageable) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        // Enforce authorization: recruiter must own the job
        if (!isAdmin && !job.getRecruiter().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to view applicants for this job.");
        }

        Page<JobApplication> page = jobApplicationRepository.findByJobIdWithDetails(jobId, pageable);
        List<ApplicationDTO.ApplicationResponse> dtos = page.getContent().stream()
                .map(this::mapToApplicationResponse)
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

    @Transactional
    public ApplicationDTO.ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationDTO.ApplicationStatusUpdateRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Verify recruiter owns the job associated with this application
        if (!isAdmin && !application.getJob().getRecruiter().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to update this applicant's status.");
        }

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newStatus = request.getStatus();

        if (oldStatus == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Cannot update status of a withdrawn application.");
        }

        application.setStatus(newStatus);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            application.setStatusNotes(request.getNotes().trim());
        }

        application = jobApplicationRepository.save(application);

        // Record history log
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .previousStatus(oldStatus.name())
                .newStatus(newStatus.name())
                .changedBy(currentUser)
                .notes(request.getNotes())
                .build();
        statusHistoryRepository.save(history);

        auditLogService.log(currentUser, "APPLICATION_STATUS_UPDATE", "APPLICATION", application.getId(),
                "Updated status from " + oldStatus + " to " + newStatus, null);

        return mapToApplicationResponse(application);
    }

    @Transactional
    public void withdrawApplication(Long applicationId) {
        Long candidateId = SecurityUtils.getCurrentUserId();
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!application.getCandidate().getId().equals(candidateId)) {
            throw new ForbiddenException("You do not have permission to withdraw this application.");
        }

        if (application.getStatus() != ApplicationStatus.APPLIED && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new BadRequestException("Application cannot be withdrawn once it has reached " + application.getStatus() + " stage.");
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setStatusNotes("Application withdrawn by candidate.");
        jobApplicationRepository.save(application);

        User candidate = userRepository.findById(candidateId).orElse(null);
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .previousStatus(oldStatus.name())
                .newStatus(ApplicationStatus.WITHDRAWN.name())
                .changedBy(candidate)
                .notes("Candidate withdrew application.")
                .build();
        statusHistoryRepository.save(history);

        auditLogService.log(candidate, "APPLICATION_WITHDRAW", "APPLICATION", application.getId(), "Withdrew application", null);
    }

    public ApplicationDTO.ApplicationResponse mapToApplicationResponse(JobApplication app) {
        Job job = app.getJob();
        User candidate = app.getCandidate();
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidate.getId()).orElse(null);

        List<ApplicationStatusHistory> historyList = statusHistoryRepository.findByApplicationIdOrderByCreatedAtAsc(app.getId());
        List<ApplicationDTO.ApplicationStatusHistoryResponse> historyResponses = historyList.stream()
                .map(h -> ApplicationDTO.ApplicationStatusHistoryResponse.builder()
                        .id(h.getId())
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .changedByUserId(h.getChangedBy().getId())
                        .changedByName(h.getChangedBy().getFullName())
                        .notes(h.getNotes())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ApplicationDTO.ApplicationResponse.builder()
                .id(app.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompany().getName())
                .companyLogoUrl(job.getCompany().getLogoUrl())
                .jobLocation(job.getLocation())
                .workplaceType(job.getWorkplaceType())
                .employmentType(job.getEmploymentType())
                .candidateId(candidate.getId())
                .candidateName(candidate.getFullName())
                .candidateEmail(candidate.getEmail())
                .candidatePhone(profile != null ? profile.getPhone() : null)
                .candidateLocation(profile != null ? profile.getLocation() : null)
                .candidateHeadline(profile != null ? profile.getHeadline() : null)
                .candidateSkills(profile != null ? profile.getSkills() : null)
                .coverLetter(app.getCoverLetter())
                .resumeFilePath(app.getResumeFilePath())
                .resumeFileName(app.getResumeFileName())
                .status(app.getStatus())
                .statusNotes(app.getStatusNotes())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .statusHistory(historyResponses)
                .build();
    }
}
