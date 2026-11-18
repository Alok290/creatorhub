package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {

    private Long id;
    private String phone;
    private String email;
    private Role role;
    private boolean isVerified;
    private Instant createdAt;
    private Instant updatedAt;
}

