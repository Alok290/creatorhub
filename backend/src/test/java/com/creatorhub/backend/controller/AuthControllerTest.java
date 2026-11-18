package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.AuthRequestDto;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.UserRepository;
import com.creatorhub.backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.context.ActiveProfiles;
import com.creatorhub.backend.repository.ApplicationRepository;
import com.creatorhub.backend.repository.CampaignRepository;
import com.creatorhub.backend.repository.CreatorProfileRepository;
import com.creatorhub.backend.repository.MerchantProfileRepository;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CreatorProfileRepository creatorProfileRepository;

    @Autowired
    private MerchantProfileRepository merchantProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void cleanUp() {
        applicationRepository.deleteAll();
        campaignRepository.deleteAll();
        creatorProfileRepository.deleteAll();
        merchantProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        AuthRequestDto request = AuthRequestDto.builder()
                .phone("+919876543210")
                .role("CREATOR")
                .otpOrPassword("SecretPass123!")
                .email("creator@example.com")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.role", is("ROLE_CREATOR")))
                .andExpect(jsonPath("$.data.phone", is("+919876543210")));
    }

    @Test
    void testRegisterDuplicatePhoneFails() throws Exception {
        User user = User.builder()
                .phone("+919876543210")
                .role(Role.CREATOR)
                .build();
        userRepository.save(user);

        AuthRequestDto request = AuthRequestDto.builder()
                .phone("+919876543210")
                .role("CREATOR")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testLoginSuccess() throws Exception {
        User user = User.builder()
                .phone("+919876543210")
                .passwordHash(passwordEncoder.encode("Password123"))
                .role(Role.MERCHANT)
                .build();
        userRepository.save(user);

        AuthRequestDto request = AuthRequestDto.builder()
                .phone("+919876543210")
                .otpOrPassword("Password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.role", is("ROLE_MERCHANT")));
    }

    @Test
    void testLoginInvalidCredentials() throws Exception {
        User user = User.builder()
                .phone("+919876543210")
                .passwordHash(passwordEncoder.encode("CorrectPassword"))
                .role(Role.CREATOR)
                .build();
        userRepository.save(user);

        AuthRequestDto request = AuthRequestDto.builder()
                .phone("+919876543210")
                .otpOrPassword("WrongPassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testGetMeAuthenticated() throws Exception {
        User user = User.builder()
                .phone("+919876543210")
                .email("test@creatorhub.com")
                .role(Role.CREATOR)
                .build();
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.phone", is("+919876543210")))
                .andExpect(jsonPath("$.data.email", is("test@creatorhub.com")))
                .andExpect(jsonPath("$.data.role", is("CREATOR")));
    }

    @Test
    void testGetMeUnauthenticatedFails() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}

