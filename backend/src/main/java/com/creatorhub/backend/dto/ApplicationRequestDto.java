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
public class ApplicationRequestDto {

    @NotBlank(message = "Pitch proposal is required")
    private String pitch;

    private Double proposedRate;
}

