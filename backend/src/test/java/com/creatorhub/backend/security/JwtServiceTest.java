package com.creatorhub.backend.security;

import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 604800000;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", expirationMs);
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .phone("+919876543210")
                .role(Role.CREATOR)
                .build();

        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertFalse(token.isBlank());

        String username = jwtService.extractUsername(token);
        assertEquals("+919876543210", username);

        assertTrue(jwtService.isTokenValid(token, user));

        User otherUser = User.builder()
                .phone("+911234567890")
                .role(Role.MERCHANT)
                .build();
        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void testExtractRolesAndCustomClaims() {
        User user = User.builder()
                .phone("+919999988888")
                .role(Role.MERCHANT)
                .build();

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("orgId", "merchant-123");

        String token = jwtService.generateToken(user, extraClaims);
        assertNotNull(token);

        List<String> roles = jwtService.extractRoles(token);
        assertTrue(roles.contains("ROLE_MERCHANT"));

        Object orgId = jwtService.extractCustomClaim(token, "orgId");
        assertEquals("merchant-123", orgId);
    }

    @Test
    void testExpiredTokenValidation() {
        // Create token that expired 1 second ago
        String expiredToken = jwtService.generateToken("+919876543210", Map.of(), -1000);

        User user = User.builder()
                .phone("+919876543210")
                .role(Role.CREATOR)
                .build();

        assertFalse(jwtService.isTokenValid(expiredToken, user));
    }
}

