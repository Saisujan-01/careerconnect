package com.careerconnect;

import com.careerconnect.dto.AuthDTO;
import com.careerconnect.entity.CandidateProfile;
import com.careerconnect.entity.Role;
import com.careerconnect.entity.User;
import com.careerconnect.exception.BadRequestException;
import com.careerconnect.repository.CandidateProfileRepository;
import com.careerconnect.repository.RecruiterProfileRepository;
import com.careerconnect.repository.UserRepository;
import com.careerconnect.security.JwtTokenProvider;
import com.careerconnect.security.UserPrincipal;
import com.careerconnect.service.AuditLogService;
import com.careerconnect.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private User sampleCandidate;

    @BeforeEach
    void setUp() {
        sampleCandidate = User.builder()
                .id(10L)
                .email("test.candidate@example.com")
                .fullName("Test Candidate")
                .password("encoded_password")
                .role(Role.CANDIDATE)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new Candidate with BCrypt password hashing")
    void testRegisterCandidateSuccess() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .fullName("Test Candidate")
                .email("test.candidate@example.com")
                .password("Secret@123")
                .role(Role.CANDIDATE)
                .termsAccepted(true)
                .build();

        when(userRepository.existsByEmailIgnoreCase("test.candidate@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(sampleCandidate);
        when(tokenProvider.generateToken(any(UserPrincipal.class))).thenReturn("jwt_mock_token");

        AuthDTO.AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt_mock_token", response.getToken());
        assertEquals("test.candidate@example.com", response.getUser().getEmail());
        assertEquals(Role.CANDIDATE, response.getUser().getRole());

        verify(passwordEncoder).encode("Secret@123");
        verify(candidateProfileRepository).save(any(CandidateProfile.class));
    }

    @Test
    @DisplayName("Should reject public registration attempting to register as ADMIN")
    void testRegisterAdminRejected() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .fullName("Sneaky Admin")
                .email("admin.fake@example.com")
                .password("Admin@123")
                .role(Role.ADMIN)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Administrator"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration if email is already registered")
    void testRegisterDuplicateEmail() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .fullName("Alex Morgan")
                .email("alex@example.com")
                .password("Secret@123")
                .role(Role.CANDIDATE)
                .build();

        when(userRepository.existsByEmailIgnoreCase("alex@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully authenticate user during login")
    void testLoginSuccess() {
        AuthDTO.LoginRequest request = AuthDTO.LoginRequest.builder()
                .email("test.candidate@example.com")
                .password("Secret@123")
                .build();

        UserPrincipal principal = UserPrincipal.create(sampleCandidate);
        var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleCandidate));
        when(tokenProvider.generateToken(any())).thenReturn("valid_jwt_token");

        AuthDTO.AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid_jwt_token", response.getToken());
        assertEquals("test.candidate@example.com", response.getUser().getEmail());
    }
}
