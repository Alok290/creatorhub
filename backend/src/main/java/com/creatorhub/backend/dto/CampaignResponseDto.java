package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.CampaignStatus;
import com.creatorhub.backend.entity.CompensationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponseDto {

    private Long id;
    private Long merchantId;
    private String merchantBrandName;
    private String merchantCompanyName;
    private String merchantLogoUrl;
    private String merchantCity;
    private String title;
    private String description;
    private String category;
    private CompensationType compensationType;
    private Double budget;
    private String deliverables;
    private Integer minFollowers;
    private String targetCity;
    private Double targetLatitude;
    private Double targetLongitude;
    private Double radiusKm;
    private Instant deadline;
    private CampaignStatus status;
    private int applicationCount;
    private Instant createdAt;
    private Instant updatedAt;
}

