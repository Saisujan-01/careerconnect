package com.careerconnect;

import com.careerconnect.dto.ApplicationDTO;
import com.careerconnect.entity.*;
import com.careerconnect.exception.BadRequestException;
import com.careerconnect.repository.*;
import com.careerconnect.security.UserPrincipal;
import com.careerconnect.service.ApplicationService;
import com.careerconnect.service.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ApplicationService applicationService;

    private User candidate;
    private User recruiter;
    private Job job;
    private JobApplication application;

    @BeforeEach
    void setUp() {
        candidate = User.builder()
                .id(4L)
                .email("alex@example.com")
                .fullName("Alex Morgan")
                .role(Role.CANDIDATE)
                .isActive(true)
                .build();

        recruiter = User.builder()
                .id(2L)
                .email("sarah@techcorp.com")
                .fullName("Sarah Jenkins")
                .role(Role.RECRUITER)
                .isActive(true)
                .build();

        Company company = Company.builder()
                .id(1L)
                .name("TechCorp Solutions")
                .build();

        job = Job.builder()
                .id(10L)
                .title("Full Stack Developer")
                .company(company)
                .recruiter(recruiter)
                .status(JobStatus.PUBLISHED)
                .moderationStatus(ModerationStatus.APPROVED)
                .build();

        application = JobApplication.builder()
                .id(50L)
                .job(job)
                .candidate(candidate)
                .status(ApplicationStatus.APPLIED)
                .resumeFilePath("resumes/alex.pdf")
                .resumeFileName("Alex_Resume.pdf")
                .build();

        UserPrincipal principal = UserPrincipal.create(candidate);
        var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Should successfully apply for job with resume")
    void testApplySuccess() {
        ApplicationDTO.ApplicationCreateRequest req = ApplicationDTO.ApplicationCreateRequest.builder()
                .coverLetter("Excited to apply!")
                .resumeFilePath("resumes/alex.pdf")
                .resumeFileName("Alex_Resume.pdf")
                .build();

        when(userRepository.findById(4L)).thenReturn(Optional.of(candidate));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobApplicationRepository.existsByJobIdAndCandidateId(10L, 4L)).thenReturn(false);
        when(jobApplicationRepository.save(any(JobApplication.class))).thenReturn(application);

        ApplicationDTO.ApplicationResponse resp = applicationService.applyForJob(10L, req);

        assertNotNull(resp);
        assertEquals(ApplicationStatus.APPLIED, resp.getStatus());
        assertEquals("Full Stack Developer", resp.getJobTitle());
        verify(jobApplicationRepository).save(any(JobApplication.class));
        verify(statusHistoryRepository).save(any(ApplicationStatusHistory.class));
    }

    @Test
    @DisplayName("Should prevent duplicate applications for the same job and candidate")
    void testApplyDuplicatePrevented() {
        ApplicationDTO.ApplicationCreateRequest req = ApplicationDTO.ApplicationCreateRequest.builder()
                .resumeFilePath("resumes/alex.pdf")
                .build();

        when(userRepository.findById(4L)).thenReturn(Optional.of(candidate));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobApplicationRepository.existsByJobIdAndCandidateId(10L, 4L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> applicationService.applyForJob(10L, req));
        assertTrue(ex.getMessage().contains("already applied"));
        verify(jobApplicationRepository, never()).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("Should allow candidate to withdraw application in APPLIED stage")
    void testWithdrawApplicationSuccess() {
        when(jobApplicationRepository.findById(50L)).thenReturn(Optional.of(application));
        when(userRepository.findById(4L)).thenReturn(Optional.of(candidate));

        applicationService.withdrawApplication(50L);

        assertEquals(ApplicationStatus.WITHDRAWN, application.getStatus());
        verify(jobApplicationRepository).save(application);
        verify(statusHistoryRepository).save(any(ApplicationStatusHistory.class));
    }

    @Test
    @DisplayName("Should reject withdrawal if application was already shortlisted")
    void testWithdrawShortlistedApplicationRejected() {
        application.setStatus(ApplicationStatus.SHORTLISTED);
        when(jobApplicationRepository.findById(50L)).thenReturn(Optional.of(application));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> applicationService.withdrawApplication(50L));
        assertTrue(ex.getMessage().contains("cannot be withdrawn"));
        verify(jobApplicationRepository, never()).save(application);
    }
}
