package com.creatorhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequestDto {

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String role;

    private String otpOrPassword;

    private String email;

    private String brandName;

    private String displayName;

    private String otp;
}

