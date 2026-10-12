package com.careerconnect.service;

import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.entity.*;
import com.careerconnect.exception.BadRequestException;
import com.careerconnect.exception.ForbiddenException;
import com.careerconnect.exception.ResourceNotFoundException;
import com.careerconnect.repository.*;
import com.careerconnect.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<JobDTO.JobResponse> searchPublicJobs(
            String keyword,
            String location,
            String category,
            WorkplaceType workplaceType,
            EmploymentType employmentType,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String sortBy,
            int page,
            int size
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("salaryHigh".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "salaryMax");
        } else if ("salaryLow".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "salaryMin");
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(size, 50), sort);

        Page<Job> jobPage = jobRepository.searchPublicJobs(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                (location != null && !location.isBlank()) ? location.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                workplaceType,
                employmentType,
                minSalary,
                maxSalary,
                pageable
        );

        List<Long> savedJobIds = getSavedJobIdsForCurrentUser();
        List<JobDTO.JobResponse> responses = jobPage.getContent().stream()
                .map(job -> mapToJobResponse(job, savedJobIds.contains(job.getId())))
                .collect(Collectors.toList());

        return CommonDTO.PagedResponse.<JobDTO.JobResponse>builder()
                .content(responses)
                .page(jobPage.getNumber())
                .size(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .isLast(jobPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public JobDTO.JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found with id: " + id));

        // If public visitor, verify job is published and approved
        boolean isPrivileged = SecurityUtils.getCurrentUserPrincipal().map(u ->
                u.getRole() == Role.ADMIN ||
                (u.getRole() == Role.RECRUITER && job.getRecruiter().getId().equals(u.getId()))
        ).orElse(false);

        if (!isPrivileged && (job.getStatus() != JobStatus.PUBLISHED || job.getModerationStatus() != ModerationStatus.APPROVED)) {
            throw new ResourceNotFoundException("This job is currently not available.");
        }

        boolean isSaved = false;
        boolean hasApplied = false;
        Optional<Long> currentCandidateId = SecurityUtils.getCurrentUserPrincipal()
                .filter(u -> u.getRole() == Role.CANDIDATE)
                .map(u -> u.getId());

        if (currentCandidateId.isPresent()) {
            isSaved = savedJobRepository.existsByJobIdAndCandidateId(id, currentCandidateId.get());
            hasApplied = jobApplicationRepository.existsByJobIdAndCandidateId(id, currentCandidateId.get());
        }

        JobDTO.JobResponse response = mapToJobResponse(job, isSaved);
        response.setHasApplied(hasApplied);
        return response;
    }

    @Transactional
    public JobDTO.JobResponse createJob(JobDTO.JobRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User recruiter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found"));

        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only recruiters and administrators can post jobs.");
        }

        Company company = resolveCompanyForRecruiter(recruiter, request);

        Job job = Job.builder()
                .title(request.getTitle().trim())
                .company(company)
                .recruiter(recruiter)
                .description(request.getDescription())
                .responsibilities(request.getResponsibilities())
                .skillsRequired(request.getSkillsRequired())
                .qualifications(request.getQualifications())
                .category(request.getCategory().trim())
                .location(request.getLocation().trim())
                .workplaceType(request.getWorkplaceType())
                .employmentType(request.getEmploymentType())
                .experienceLevel(request.getExperienceLevel())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .salaryCurrency(request.getSalaryCurrency() != null ? request.getSalaryCurrency() : "USD")
                .isSalaryNegotiable(Boolean.TRUE.equals(request.getIsSalaryNegotiable()))
                .status(request.getStatus() != null ? request.getStatus() : JobStatus.PUBLISHED)
                .moderationStatus(ModerationStatus.APPROVED)
                .applicationDeadline(request.getApplicationDeadline())
                .build();

        job = jobRepository.save(job);
        auditLogService.log(recruiter, "JOB_CREATE", "JOB", job.getId(), "Created job: " + job.getTitle(), null);

        return mapToJobResponse(job, false);
    }

    @Transactional
    public JobDTO.JobResponse updateJob(Long id, JobDTO.JobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found with id: " + id));

        verifyRecruiterOwnership(job);

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription());
        job.setResponsibilities(request.getResponsibilities());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setQualifications(request.getQualifications());
        job.setCategory(request.getCategory().trim());
        job.setLocation(request.getLocation().trim());
        job.setWorkplaceType(request.getWorkplaceType());
        job.setEmploymentType(request.getEmploymentType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        if (request.getSalaryCurrency() != null) {
            job.setSalaryCurrency(request.getSalaryCurrency());
        }
        if (request.getIsSalaryNegotiable() != null) {
            job.setIsSalaryNegotiable(request.getIsSalaryNegotiable());
        }
        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }
        job.setApplicationDeadline(request.getApplicationDeadline());

        job = jobRepository.save(job);
        auditLogService.log(job.getRecruiter(), "JOB_UPDATE", "JOB", job.getId(), "Updated job: " + job.getTitle(), null);

        return mapToJobResponse(job, false);
    }

    @Transactional
    public JobDTO.JobResponse updateJobStatus(Long id, JobStatus newStatus) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found with id: " + id));

        verifyRecruiterOwnership(job);
        job.setStatus(newStatus);
        job = jobRepository.save(job);

        auditLogService.log(job.getRecruiter(), "JOB_STATUS_CHANGE", "JOB", job.getId(), "Changed status to: " + newStatus, null);
        return mapToJobResponse(job, false);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found with id: " + id));

        verifyRecruiterOwnership(job);

        // Check if applications exist: soft delete/archive to preserve historical records safely
        long appCount = jobApplicationRepository.findByJobIdWithDetails(id, PageRequest.of(0, 1)).getTotalElements();
        if (appCount > 0) {
            job.setStatus(JobStatus.ARCHIVED);
            jobRepository.save(job);
            auditLogService.log(job.getRecruiter(), "JOB_ARCHIVE", "JOB", job.getId(), "Archived job with existing applications", null);
        } else {
            jobRepository.delete(job);
            auditLogService.log(job.getRecruiter(), "JOB_DELETE", "JOB", job.getId(), "Deleted job posting", null);
        }
    }

    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getFeaturedJobs() {
        List<Job> jobs = jobRepository.findTopFeaturedJobs(PageRequest.of(0, 6));
        List<Long> savedJobIds = getSavedJobIdsForCurrentUser();
        return jobs.stream()
                .map(j -> mapToJobResponse(j, savedJobIds.contains(j.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getRelatedJobs(Long jobId) {
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) return List.of();

        List<Job> related = jobRepository.findRelatedJobs(job.getCategory(), jobId, PageRequest.of(0, 3));
        List<Long> savedJobIds = getSavedJobIdsForCurrentUser();
        return related.stream()
                .map(j -> mapToJobResponse(j, savedJobIds.contains(j.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return List.of(
                "Software Development",
                "Data Science",
                "Design",
                "Marketing",
                "Finance",
                "Human Resources",
                "Sales",
                "Customer Support"
        );
    }

    private Company resolveCompanyForRecruiter(User recruiter, JobDTO.JobRequest request) {
        if (request.getCompanyId() != null) {
            return companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new BadRequestException("Selected company does not exist."));
        }

        Optional<RecruiterProfile> profileOpt = recruiterProfileRepository.findByUserId(recruiter.getId());
        if (profileOpt.isPresent() && profileOpt.get().getCompany() != null) {
            return profileOpt.get().getCompany();
        }

        String compName = (request.getCompanyName() != null && !request.getCompanyName().isBlank())
                ? request.getCompanyName().trim()
                : "Recruiter Organization";

        Company company = companyRepository.findByNameIgnoreCase(compName)
                .orElseGet(() -> companyRepository.save(Company.builder()
                        .name(compName)
                        .description("Corporate employer profile")
                        .industry("Technology")
                        .location(request.getLocation())
                        .build()));

        if (profileOpt.isPresent()) {
            RecruiterProfile prof = profileOpt.get();
            prof.setCompany(company);
            recruiterProfileRepository.save(prof);
        }

        return company;
    }

    private void verifyRecruiterOwnership(Job job) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();
        if (!isAdmin && !job.getRecruiter().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to modify this job posting.");
        }
    }

    private List<Long> getSavedJobIdsForCurrentUser() {
        return SecurityUtils.getCurrentUserPrincipal()
                .filter(u -> u.getRole() == Role.CANDIDATE)
                .map(u -> savedJobRepository.findSavedJobIdsByCandidateId(u.getId()))
                .orElse(List.of());
    }

    public JobDTO.JobResponse mapToJobResponse(Job job, Boolean isSaved) {
        return JobDTO.JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(JobDTO.CompanySummary.builder()
                        .id(job.getCompany().getId())
                        .name(job.getCompany().getName())
                        .description(job.getCompany().getDescription())
                        .website(job.getCompany().getWebsite())
                        .industry(job.getCompany().getIndustry())
                        .location(job.getCompany().getLocation())
                        .logoUrl(job.getCompany().getLogoUrl())
                        .build())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getFullName())
                .description(job.getDescription())
                .responsibilities(job.getResponsibilities())
                .skillsRequired(job.getSkillsRequired())
                .qualifications(job.getQualifications())
                .category(job.getCategory())
                .location(job.getLocation())
                .workplaceType(job.getWorkplaceType())
                .employmentType(job.getEmploymentType())
                .experienceLevel(job.getExperienceLevel())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryCurrency(job.getSalaryCurrency())
                .isSalaryNegotiable(job.getIsSalaryNegotiable())
                .status(job.getStatus())
                .moderationStatus(job.getModerationStatus())
                .applicationDeadline(job.getApplicationDeadline())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .isSaved(isSaved)
                .build();
    }
}
