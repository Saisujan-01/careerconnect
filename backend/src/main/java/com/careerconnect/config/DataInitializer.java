package com.careerconnect.config;

import com.careerconnect.entity.*;
import com.careerconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking CareerConnect demo user credentials and initial setup...");

        // Ensure Admin exists with valid BCrypt hash
        userRepository.findByEmailIgnoreCase("admin@careerconnect.com").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("Admin@123"));
                    userRepository.save(admin);
                    log.info("Verified demo admin: admin@careerconnect.com (Admin@123)");
                },
                () -> {
                    User admin = User.builder()
                            .email("admin@careerconnect.com")
                            .password(passwordEncoder.encode("Admin@123"))
                            .fullName("Platform Administrator")
                            .role(Role.ADMIN)
                            .isActive(true)
                            .build();
                    userRepository.save(admin);
                    log.info("Created demo admin: admin@careerconnect.com (Admin@123)");
                }
        );

        // Ensure Sarah (Recruiter) has valid password
        userRepository.findByEmailIgnoreCase("recruiter.sarah@techcorp.com").ifPresent(recruiter -> {
            recruiter.setPassword(passwordEncoder.encode("Recruiter@123"));
            userRepository.save(recruiter);
            log.info("Verified demo recruiter: recruiter.sarah@techcorp.com (Recruiter@123)");
        });

        // Ensure David (Recruiter) has valid password
        userRepository.findByEmailIgnoreCase("recruiter.david@finedge.com").ifPresent(recruiter -> {
            recruiter.setPassword(passwordEncoder.encode("Recruiter@123"));
            userRepository.save(recruiter);
        });

        // Ensure Alex (Candidate) has valid password
        userRepository.findByEmailIgnoreCase("candidate.alex@example.com").ifPresent(candidate -> {
            candidate.setPassword(passwordEncoder.encode("Candidate@123"));
            userRepository.save(candidate);
            log.info("Verified demo candidate: candidate.alex@example.com (Candidate@123)");
        });

        // Ensure Priya & Jordan (Candidates) have valid passwords
        userRepository.findByEmailIgnoreCase("candidate.priya@example.com").ifPresent(candidate -> {
            candidate.setPassword(passwordEncoder.encode("Candidate@123"));
            userRepository.save(candidate);
        });

        userRepository.findByEmailIgnoreCase("candidate.jordan@example.com").ifPresent(candidate -> {
            candidate.setPassword(passwordEncoder.encode("Candidate@123"));
            userRepository.save(candidate);
        });

        log.info("CareerConnect demo accounts ready for presentation!");
    }
}
