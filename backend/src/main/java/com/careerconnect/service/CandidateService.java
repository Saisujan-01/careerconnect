package com.careerconnect.service;

import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.dto.CandidateDTO;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationService applicationService;
    private final JobService jobService;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public CandidateDTO.CandidateProfileResponse getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder().user(user).build()));

        return mapToProfileResponse(user, profile);
    }

    @Transactional
    public CandidateDTO.CandidateProfileResponse updateProfile(CandidateDTO.CandidateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.CANDIDATE) {
            throw new ForbiddenException("Only candidates have candidate profiles.");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        profile.setPhone(request.getPhone());
        profile.setLocation(request.getLocation());
        profile.setHeadline(request.getHeadline());
        profile.setSummary(request.getSummary());
        profile.setSkills(request.getSkills());
        profile.setEducation(request.getEducation());
        profile.setExperience(request.getExperience());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());

        profile = candidateProfileRepository.save(profile);
        auditLogService.log(user, "PROFILE_UPDATE", "CANDIDATE_PROFILE", profile.getId(), "Updated candidate profile", null);

        return mapToProfileResponse(user, profile);
    }

    @Transactional
    public CandidateDTO.CandidateProfileResponse uploadResume(MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FileStorageService.StoredFile storedFile = fileStorageService.storeResume(file);

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        profile.setResumeFilePath(storedFile.getRelativePath());
        profile.setResumeFileName(storedFile.getOriginalFilename());
        profile = candidateProfileRepository.save(profile);

        auditLogService.log(user, "RESUME_UPLOAD", "CANDIDATE_PROFILE", profile.getId(), "Uploaded resume: " + storedFile.getOriginalFilename(), null);

        return mapToProfileResponse(user, profile);
    }

    @Transactional
    public void saveJob(Long jobId) {
        Long candidateId = SecurityUtils.getCurrentUserId();
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (savedJobRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            return; // Already saved, idempotent
        }

        SavedJob savedJob = SavedJob.builder()
                .candidate(candidate)
                .job(job)
                .build();
        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(Long jobId) {
        Long candidateId = SecurityUtils.getCurrentUserId();
        savedJobRepository.deleteByJobIdAndCandidateId(jobId, candidateId);
    }

    @Transactional(readOnly = true)
    public CommonDTO.PagedResponse<JobDTO.JobResponse> getSavedJobs(Pageable pageable) {
        Long candidateId = SecurityUtils.getCurrentUserId();
        Page<SavedJob> savedJobPage = savedJobRepository.findByCandidateIdWithDetails(candidateId, pageable);

        List<JobDTO.JobResponse> jobs = savedJobPage.getContent().stream()
                .map(s -> jobService.mapToJobResponse(s.getJob(), true))
                .collect(Collectors.toList());

        return CommonDTO.PagedResponse.<JobDTO.JobResponse>builder()
                .content(jobs)
                .page(savedJobPage.getNumber())
                .size(savedJobPage.getSize())
                .totalElements(savedJobPage.getTotalElements())
                .totalPages(savedJobPage.getTotalPages())
                .isLast(savedJobPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CandidateDTO.CandidateDashboardResponse getDashboard() {
        Long candidateId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        CandidateDTO.CandidateProfileResponse profileResponse = mapToProfileResponse(user, profile);

        long totalApps = jobApplicationRepository.countByCandidateId(candidateId);
        long pendingApps = jobApplicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.APPLIED) +
                           jobApplicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.UNDER_REVIEW);
        long shortlistedApps = jobApplicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.SHORTLISTED);
        long selectedApps = jobApplicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.SELECTED);
        long rejectedApps = jobApplicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.REJECTED);
        long savedJobsCount = savedJobRepository.countByCandidateId(candidateId);

        // Recent applications (up to 5)
        Page<JobApplication> recentAppPage = jobApplicationRepository.findByCandidateIdWithDetails(candidateId, PageRequest.of(0, 5));
        List<ApplicationDTO.ApplicationResponse> recentApps = recentAppPage.getContent().stream()
                .map(applicationService::mapToApplicationResponse)
                .collect(Collectors.toList());

        // Recommended jobs based on candidate skills or category
        String primarySkill = "Java";
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) {
            String[] split = profile.getSkills().split("[,;]");
            if (split.length > 0) {
                primarySkill = split[0].trim();
            }
        }
        List<Job> recList = jobRepository.findRecommendedJobs("Software Development", primarySkill, PageRequest.of(0, 4));
        List<Long> savedIds = savedJobRepository.findSavedJobIdsByCandidateId(candidateId);
        List<JobDTO.JobResponse> recommendedJobs = recList.stream()
                .map(j -> jobService.mapToJobResponse(j, savedIds.contains(j.getId())))
                .collect(Collectors.toList());

        return CandidateDTO.CandidateDashboardResponse.builder()
                .profile(profileResponse)
                .completionPercentage(profileResponse.getCompletionPercentage())
                .totalApplications(totalApps)
                .pendingApplications(pendingApps)
                .shortlistedApplications(shortlistedApps)
                .selectedApplications(selectedApps)
                .rejectedApplications(rejectedApps)
                .savedJobsCount(savedJobsCount)
                .recentApplications(recentApps)
                .recommendedJobs(recommendedJobs)
                .build();
    }

    private CandidateDTO.CandidateProfileResponse mapToProfileResponse(User user, CandidateProfile profile) {
        int percentage = calculateCompletionPercentage(user, profile);

        return CandidateDTO.CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .skills(profile.getSkills())
                .education(profile.getEducation())
                .experience(profile.getExperience())
                .linkedinUrl(profile.getLinkedinUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .resumeFilePath(profile.getResumeFilePath())
                .resumeFileName(profile.getResumeFileName())
                .completionPercentage(percentage)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private int calculateCompletionPercentage(User user, CandidateProfile profile) {
        int score = 0;
        int total = 9;

        if (user.getFullName() != null && !user.getFullName().isBlank()) score++;
        if (profile.getPhone() != null && !profile.getPhone().isBlank()) score++;
        if (profile.getLocation() != null && !profile.getLocation().isBlank()) score++;
        if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) score++;
        if (profile.getSummary() != null && !profile.getSummary().isBlank()) score++;
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) score++;
        if (profile.getEducation() != null && !profile.getEducation().isBlank()) score++;
        if (profile.getExperience() != null && !profile.getExperience().isBlank()) score++;
        if (profile.getResumeFilePath() != null && !profile.getResumeFilePath().isBlank()) score++;

        return Math.round(((float) score / total) * 100);
    }
}
