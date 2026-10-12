package com.careerconnect;

import com.careerconnect.dto.AuthDTO;
import com.careerconnect.entity.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/register should create a candidate and return JWT")
    void testRegisterEndpoint() throws Exception {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .fullName("Integration Tester")
                .email("it.tester@example.com")
                .password("Password@123")
                .role(Role.CANDIDATE)
                .termsAccepted(true)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("it.tester@example.com"))
                .andExpect(jsonPath("$.data.user.role").value("CANDIDATE"));
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate seeded demo candidate")
    void testLoginEndpoint() throws Exception {
        AuthDTO.LoginRequest request = AuthDTO.LoginRequest.builder()
                .email("admin@careerconnect.com")
                .password("Admin@123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"));
    }
}
