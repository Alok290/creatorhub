package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.AuthRequestDto;
import com.creatorhub.backend.dto.AuthResponseDto;
import com.creatorhub.backend.dto.UserResponseDto;
import com.creatorhub.backend.entity.CreatorProfile;
import com.creatorhub.backend.entity.MerchantProfile;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.CreatorProfileRepository;
import com.creatorhub.backend.repository.MerchantProfileRepository;
import com.creatorhub.backend.repository.UserRepository;
import com.creatorhub.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SmsService smsService;

    private static class OtpRecord {
        final String otp;
        final Instant expiresAt;

        OtpRecord(String otp, Instant expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();
    private final Set<String> verifiedPhones = ConcurrentHashMap.newKeySet();

    public String normalizePhone(String rawPhone) {
        if (rawPhone == null) return "";
        String cleaned = rawPhone.trim().replaceAll("[^0-9+]", "");
        if (!cleaned.startsWith("+") && cleaned.length() == 10) {
            cleaned = "+91" + cleaned;
        }
        return cleaned;
    }

    public Map<String, Object> sendRegistrationOtp(String rawPhone) {
        String phone = normalizePhone(rawPhone);
        String rawTrimmed = rawPhone != null ? rawPhone.trim() : "";
        if (phone.length() < 8) {
            throw new IllegalArgumentException("Please enter a valid phone number with at least 8 digits");
        }

        // 1. Strict Uniqueness Check: Cannot send OTP if phone already registered
        if (userRepository.existsByPhone(phone) || userRepository.existsByPhone(rawTrimmed)) {
            throw new IllegalArgumentException("An account with phone number " + rawTrimmed + " already exists. Please log in instead.");
        }

        // 2. Generate secure 6-digit fallback OTP
        int code = 100000 + new java.security.SecureRandom().nextInt(900000);
        String otp = String.valueOf(code);

        // 3. Dispatch real SMS to recipient handset via SMS Gateway
        String deliveredOtp = smsService.sendOtpSms(phone, otp);
        boolean delivered = (deliveredOtp != null && !deliveredOtp.isBlank());
        if (delivered) {
            otp = deliveredOtp; // Use the exact 6-digit code sent in the carrier SMS
        }

        // Store with 5-minute expiration
        otpStore.put(phone, new OtpRecord(otp, Instant.now().plusSeconds(300)));
        if (!rawTrimmed.equals(phone)) {
            otpStore.put(rawTrimmed, new OtpRecord(otp, Instant.now().plusSeconds(300)));
        }

        log.info("[CreatorHub OTP Verification] Phone: {} | Active 6-Digit Code: {} | Carrier SMS Delivered: {}", phone, otp, delivered);

        Map<String, Object> response = new HashMap<>();
        response.put("phone", phone);
        if (delivered) {
            response.put("message", "6-digit OTP code has been sent via SMS to " + rawTrimmed + ". Please check your mobile phone.");
        } else {
            response.put("message", "SMS Gateway credentials required in Render. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.");
        }
        // Strict production security: NEVER return OTP in JSON API response
        return response;
    }

    public boolean verifyRegistrationOtp(String rawPhone, String inputOtp) {
        String phone = normalizePhone(rawPhone);
        String rawTrimmed = rawPhone != null ? rawPhone.trim() : "";
        if (inputOtp == null || inputOtp.isBlank()) {
            throw new IllegalArgumentException("Please enter the 6-digit OTP code");
        }

        // If phone is already verified, succeed immediately
        if (verifiedPhones.contains(phone) || verifiedPhones.contains(rawTrimmed)) {
            return true;
        }

        OtpRecord record = otpStore.get(phone);
        if (record == null) {
            record = otpStore.get(rawTrimmed);
        }

        if (record == null) {
            throw new IllegalArgumentException("No OTP found for " + rawTrimmed + ". Please click 'Send OTP' first.");
        }

        if (Instant.now().isAfter(record.expiresAt)) {
            otpStore.remove(phone);
            otpStore.remove(rawTrimmed);
            throw new IllegalArgumentException("The OTP code has expired. Please request a new OTP.");
        }

        if (!record.otp.equals(inputOtp.trim())) {
            throw new IllegalArgumentException("Invalid OTP code. Please enter the correct 6-digit code.");
        }

        // Mark phone as verified
        otpStore.remove(phone);
        otpStore.remove(rawTrimmed);
        verifiedPhones.add(phone);
        verifiedPhones.add(rawTrimmed);
        log.info("[CreatorHub OTP] Verified phone number: {}", phone);
        return true;
    }

    @Transactional
    public AuthResponseDto register(AuthRequestDto request) {
        String phone = normalizePhone(request.getPhone());
        String rawPhone = request.getPhone() != null ? request.getPhone().trim() : "";

        // Strict Uniqueness Check
        if (userRepository.existsByPhone(phone) || userRepository.existsByPhone(rawPhone)) {
            throw new IllegalArgumentException("User with phone " + rawPhone + " already exists. Please log in instead.");
        }

        // Check OTP Verification
        boolean isVerified = false;
        if (verifiedPhones.contains(phone) || verifiedPhones.contains(rawPhone)) {
            isVerified = true;
            verifiedPhones.remove(phone);
            verifiedPhones.remove(rawPhone);
        } else if (request.getOtp() != null && !request.getOtp().isBlank()) {
            verifyRegistrationOtp(rawPhone, request.getOtp());
            isVerified = true;
        } else if (otpStore.containsKey(phone) || otpStore.containsKey(rawPhone)) {
            throw new IllegalArgumentException("Please verify your phone number with the 6-digit OTP to complete registration.");
        }

        Role assignedRole = Role.fromString(request.getRole());

        String passwordHash = null;
        if (request.getOtpOrPassword() != null && !request.getOtpOrPassword().isBlank()) {
            passwordHash = passwordEncoder.encode(request.getOtpOrPassword());
        }

        User user = User.builder()
                .phone(phone.isBlank() ? rawPhone : phone)
                .passwordHash(passwordHash)
                .email(request.getEmail())
                .role(assignedRole)
                .isVerified(isVerified)
                .build();

        User savedUser = userRepository.save(user);

        // Automatically initialize profile with Brand Name or Creator Name if provided
        if (assignedRole == Role.MERCHANT) {
            String brand = (request.getBrandName() != null && !request.getBrandName().isBlank())
                    ? request.getBrandName().trim()
                    : "Brand " + savedUser.getId();
            MerchantProfile merchantProfile = MerchantProfile.builder()
                    .user(savedUser)
                    .brandName(brand)
                    .companyName(brand)
                    .build();
            merchantProfileRepository.save(merchantProfile);
        } else if (assignedRole == Role.CREATOR && request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            CreatorProfile creatorProfile = CreatorProfile.builder()
                    .user(savedUser)
                    .displayName(request.getDisplayName().trim())
                    .build();
            creatorProfileRepository.save(creatorProfile);
        }
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

