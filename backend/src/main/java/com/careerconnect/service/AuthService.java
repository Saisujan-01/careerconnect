package com.careerconnect.service;

import com.careerconnect.dto.AuthDTO;
import com.careerconnect.entity.CandidateProfile;
import com.careerconnect.entity.RecruiterProfile;
import com.careerconnect.entity.Role;
import com.careerconnect.entity.User;
import com.careerconnect.exception.BadRequestException;
import com.careerconnect.exception.UnauthorizedException;
import com.careerconnect.repository.CandidateProfileRepository;
import com.careerconnect.repository.RecruiterProfileRepository;
import com.careerconnect.repository.UserRepository;
import com.careerconnect.security.JwtTokenProvider;
import com.careerconnect.security.SecurityUtils;
import com.careerconnect.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        // Enforce restriction: public registration cannot create ADMIN accounts
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Public registration cannot create an Administrator account.");
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Auto-provision corresponding profile
        if (user.getRole() == Role.CANDIDATE) {
            CandidateProfile candidateProfile = CandidateProfile.builder()
                    .user(user)
                    .headline("Aspiring Professional")
                    .build();
            candidateProfileRepository.save(candidateProfile);
        } else if (user.getRole() == Role.RECRUITER) {
            RecruiterProfile recruiterProfile = RecruiterProfile.builder()
                    .user(user)
                    .title("Hiring Specialist")
                    .build();
            recruiterProfileRepository.save(recruiterProfile);
        }

        auditLogService.log(user, "USER_REGISTER", "USER", user.getId(), "User registered as " + user.getRole(), null);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(userPrincipal);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .user(mapToUserSummary(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (!userPrincipal.isActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact an administrator.");
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String token = tokenProvider.generateToken(userPrincipal);
        auditLogService.log(user, "USER_LOGIN", "USER", user.getId(), "User logged in", null);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .user(mapToUserSummary(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDTO.UserSummary getCurrentUserSummary() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return mapToUserSummary(user);
    }

    @Transactional
    public void changePassword(AuthDTO.PasswordChangeRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogService.log(user, "PASSWORD_CHANGE", "USER", user.getId(), "User changed password", null);
    }

    private AuthDTO.UserSummary mapToUserSummary(User user) {
        return AuthDTO.UserSummary.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
