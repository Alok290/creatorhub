package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.ApplicationStatus;
import com.creatorhub.backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {

    private Long id;
    private Long campaignId;
    private String campaignTitle;
    private String campaignCategory;
    private Double campaignBudget;
    private String campaignTargetCity;
    private Long merchantId;
    private String merchantBrandName;
    private String merchantLogoUrl;

    private Long creatorId;
    private String creatorName;
    private String creatorPhone;
    private String creatorEmail;
    private String creatorAvatarUrl;
    private String creatorCity;
    private Long creatorTotalFollowers;
    private String creatorCategories;
    private String creatorInstagramHandle;

    private String pitch;
    private Double proposedRate;
    private ApplicationStatus status;
    private String deliverableUrl;
    private String deliverableNotes;
    private PaymentStatus paymentStatus;
    private String merchantFeedback;
    private String creatorFeedback;
    private Integer rating;
    private Instant createdAt;
    private Instant updatedAt;
}

