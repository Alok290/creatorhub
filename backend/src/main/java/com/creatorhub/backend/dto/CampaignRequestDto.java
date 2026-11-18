package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.CompensationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Compensation type is required")
    private CompensationType compensationType;

    @NotNull(message = "Budget is required")
    private Double budget;

    private String deliverables;
    private Integer minFollowers;
    private String targetCity;
    private Double targetLatitude;
    private Double targetLongitude;
    private Double radiusKm;
    private Instant deadline;
}

