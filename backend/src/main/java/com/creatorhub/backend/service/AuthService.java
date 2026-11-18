package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.AuthRequestDto;
import com.creatorhub.backend.dto.AuthResponseDto;
import com.creatorhub.backend.dto.UserResponseDto;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.UserRepository;
import com.creatorhub.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDto register(AuthRequestDto request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("User with phone " + request.getPhone() + " already exists");
        }

        Role assignedRole = Role.fromString(request.getRole());

        String passwordHash = null;
        if (request.getOtpOrPassword() != null && !request.getOtpOrPassword().isBlank()) {
            passwordHash = passwordEncoder.encode(request.getOtpOrPassword());
        }

        User user = User.builder()
                .phone(request.getPhone())
                .passwordHash(passwordHash)
                .email(request.getEmail())
                .role(assignedRole)
                .isVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return AuthResponseDto.builder()
                .token(token)
                .role(savedUser.getRole().getAuthority())
                .phone(savedUser.getPhone())
                .userId(savedUser.getId())
                .message("User registered successfully")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(AuthRequestDto request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + request.getPhone()));

        if (user.getPasswordHash() != null && request.getOtpOrPassword() != null) {
            if (!passwordEncoder.matches(request.getOtpOrPassword(), user.getPasswordHash())) {
                throw new BadCredentialsException("Invalid credentials");
            }
        }

        String token = jwtService.generateToken(user);

        return AuthResponseDto.builder()
                .token(token)
                .role(user.getRole().getAuthority())
                .phone(user.getPhone())
                .userId(user.getId())
                .message("Login successful")
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUserProfile(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + phone));

        return UserResponseDto.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .isVerified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

