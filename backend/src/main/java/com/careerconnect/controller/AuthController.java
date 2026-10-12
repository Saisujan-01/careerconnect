package com.careerconnect.controller;

import com.careerconnect.dto.AuthDTO;
import com.careerconnect.dto.CommonDTO;
import com.careerconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and profile info")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new Candidate or Recruiter account")
    public ResponseEntity<CommonDTO.ApiResponse<AuthDTO.AuthResponse>> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        AuthDTO.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonDTO.ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<CommonDTO.ApiResponse<AuthDTO.AuthResponse>> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthDTO.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve currently authenticated user information")
    public ResponseEntity<CommonDTO.ApiResponse<AuthDTO.UserSummary>> getCurrentUser() {
        AuthDTO.UserSummary userSummary = authService.getCurrentUserSummary();
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(userSummary));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change authenticated user password")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> changePassword(@Valid @RequestBody AuthDTO.PasswordChangeRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Password updated successfully", null));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user (clears client session)")
    public ResponseEntity<CommonDTO.ApiResponse<Void>> logout() {
        return ResponseEntity.ok(CommonDTO.ApiResponse.ok("Logged out successfully", null));
    }
}
