package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.ApiResponse;
import com.creatorhub.backend.dto.AuthRequestDto;
import com.creatorhub.backend.dto.AuthResponseDto;
import com.creatorhub.backend.dto.UserResponseDto;
import com.creatorhub.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@Valid @RequestBody AuthRequestDto request) {
        AuthResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@Valid @RequestBody AuthRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        UserResponseDto profile = authService.getCurrentUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }
}

