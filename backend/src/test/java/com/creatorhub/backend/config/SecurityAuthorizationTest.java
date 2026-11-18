package com.creatorhub.backend.config;

import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.UserRepository;
import com.creatorhub.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ActiveProfiles;
import com.creatorhub.backend.repository.ApplicationRepository;
import com.creatorhub.backend.repository.CampaignRepository;
import com.creatorhub.backend.repository.CreatorProfileRepository;
import com.creatorhub.backend.repository.MerchantProfileRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuthorizationTest {

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
    private JwtService jwtService;

    private User merchantUser;
    private User creatorUser;
    private String merchantToken;
    private String creatorToken;

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
        campaignRepository.deleteAll();
        creatorProfileRepository.deleteAll();
        merchantProfileRepository.deleteAll();
        userRepository.deleteAll();

        merchantUser = User.builder()
                .phone("+911111111111")
                .role(Role.MERCHANT)
                .build();
        merchantUser = userRepository.save(merchantUser);
        merchantToken = jwtService.generateToken(merchantUser);

        creatorUser = User.builder()
                .phone("+912222222222")
                .role(Role.CREATOR)
                .build();
        creatorUser = userRepository.save(creatorUser);
        creatorToken = jwtService.generateToken(creatorUser);
    }

    @Test
    void testMerchantEndpointWithMerchantTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/merchants/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + merchantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testMerchantEndpointWithCreatorTokenIsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/merchants/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + creatorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreatorEndpointWithCreatorTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/creators/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + creatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testCreatorEndpointWithMerchantTokenIsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/creators/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + merchantToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testProtectedEndpointWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/merchants/dashboard"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/creators/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}

