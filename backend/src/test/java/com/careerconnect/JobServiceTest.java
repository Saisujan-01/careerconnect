package com.careerconnect;

import com.careerconnect.dto.JobDTO;
import com.careerconnect.entity.*;
import com.careerconnect.exception.ForbiddenException;
import com.careerconnect.repository.*;
import com.careerconnect.security.UserPrincipal;
import com.careerconnect.service.AuditLogService;
import com.careerconnect.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @Mock
    private SavedJobRepository savedJobRepository;

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private JobService jobService;

    private User recruiter;
    private Company company;
    private Job sampleJob;

    @BeforeEach
    void setUp() {
        recruiter = User.builder()
                .id(2L)
                .email("recruiter@example.com")
                .fullName("Sarah Jenkins")
                .role(Role.RECRUITER)
                .isActive(true)
                .build();

        company = Company.builder()
                .id(1L)
                .name("TechCorp Solutions")
                .industry("Cloud")
                .location("San Francisco, CA")
                .build();

        sampleJob = Job.builder()
                .id(100L)
                .title("Senior Java Developer")
                .company(company)
                .recruiter(recruiter)
                .description("Build scalable distributed systems.")
                .category("Software Development")
                .location("San Francisco, CA")
                .workplaceType(WorkplaceType.HYBRID)
                .employmentType(EmploymentType.FULL_TIME)
                .salaryMin(BigDecimal.valueOf(120000))
                .salaryMax(BigDecimal.valueOf(150000))
                .status(JobStatus.PUBLISHED)
                .moderationStatus(ModerationStatus.APPROVED)
                .build();

        // Setup SecurityContext
        UserPrincipal principal = UserPrincipal.create(recruiter);
        var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Should successfully create a job posting for recruiter")
    void testCreateJobSuccess() {
        JobDTO.JobRequest request = JobDTO.JobRequest.builder()
                .title("Senior Java Developer")
                .companyId(1L)
                .description("Build scalable distributed systems.")
                .category("Software Development")
                .location("San Francisco, CA")
                .workplaceType(WorkplaceType.HYBRID)
                .employmentType(EmploymentType.FULL_TIME)
                .salaryMin(BigDecimal.valueOf(120000))
                .salaryMax(BigDecimal.valueOf(150000))
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(recruiter));
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        JobDTO.JobResponse response = jobService.createJob(request);

        assertNotNull(response);
        assertEquals("Senior Java Developer", response.getTitle());
        assertEquals("TechCorp Solutions", response.getCompany().getName());
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    @DisplayName("Should prevent updating another recruiter's job posting")
    void testUpdateJobForbiddenForOtherRecruiter() {
        // Authenticate a different recruiter (id 99L)
        User otherRecruiter = User.builder()
                .id(99L)
                .email("other@example.com")
                .fullName("Other Recruiter")
                .role(Role.RECRUITER)
                .isActive(true)
                .build();
        UserPrincipal otherPrincipal = UserPrincipal.create(otherRecruiter);
        var auth = new UsernamePasswordAuthenticationToken(otherPrincipal, null, otherPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(jobRepository.findById(100L)).thenReturn(Optional.of(sampleJob));

        JobDTO.JobRequest request = JobDTO.JobRequest.builder()
                .title("Unauthorized Title Update")
                .description("Hacking attempt")
                .category("Software Development")
                .location("Remote")
                .workplaceType(WorkplaceType.REMOTE)
                .employmentType(EmploymentType.FULL_TIME)
                .build();

        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> jobService.updateJob(100L, request));
        assertTrue(ex.getMessage().contains("permission"));
        verify(jobRepository, never()).save(any(Job.class));
    }

    @Test
    @DisplayName("Should update job status when called by job owner")
    void testUpdateJobStatusSuccess() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(sampleJob));
        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> inv.getArgument(0));

        JobDTO.JobResponse response = jobService.updateJobStatus(100L, JobStatus.CLOSED);

        assertNotNull(response);
        assertEquals(JobStatus.CLOSED, response.getStatus());
        verify(jobRepository).save(sampleJob);
    }
}
