package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.ApplicationRequestDto;
import com.creatorhub.backend.dto.ApplicationResponseDto;
import com.creatorhub.backend.dto.ApplicationStatusUpdateDto;
import com.creatorhub.backend.dto.DeliverableSubmissionDto;
import com.creatorhub.backend.entity.*;
import com.creatorhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final MerchantProfileRepository merchantProfileRepository;

    @Transactional
    public ApplicationResponseDto apply(String creatorPhone, Long campaignId, ApplicationRequestDto req) {
        User creator = userRepository.findByPhone(creatorPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Creator not found: " + creatorPhone));

        if (creator.getRole() != Role.CREATOR) {
            throw new AccessDeniedException("Only creators can apply for campaigns");
        }

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new IllegalStateException("This campaign is not accepting applications");
        }

        if (applicationRepository.existsByCampaignIdAndCreatorId(campaignId, creator.getId())) {
            throw new IllegalArgumentException("You have already applied to this campaign");
        }

        Application application = Application.builder()
                .campaign(campaign)
                .creator(creator)
                .pitch(req.getPitch())
                .proposedRate(req.getProposedRate() != null ? req.getProposedRate() : campaign.getBudget())
                .status(ApplicationStatus.APPLIED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getCreatorApplications(String creatorPhone) {
        return applicationRepository.findByCreatorPhoneOrderByCreatedAtDesc(creatorPhone)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getCampaignApplications(String merchantPhone, Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        if (!campaign.getMerchant().getPhone().equals(merchantPhone)) {
            throw new AccessDeniedException("Not authorized to view applications for this campaign");
        }

        return applicationRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMerchantCollaborations(String merchantPhone) {
        return applicationRepository.findByCampaignMerchantPhoneOrderByCreatedAtDesc(merchantPhone)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ApplicationResponseDto updateApplicationStatus(String merchantPhone, Long applicationId, ApplicationStatusUpdateDto req) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));

        if (!application.getCampaign().getMerchant().getPhone().equals(merchantPhone)) {
            throw new AccessDeniedException("Not authorized to update this application");
        }

        application.setStatus(req.getStatus());
        if (req.getFeedback() != null) {
            application.setMerchantFeedback(req.getFeedback());
        }
        if (req.getRating() != null) {
            application.setRating(req.getRating());
        }
        if (req.getStatus() == ApplicationStatus.COMPLETED) {
            application.setPaymentStatus(PaymentStatus.PAID);
        }

        Application saved = applicationRepository.save(application);
        return toDto(saved);
    }

    @Transactional
    public ApplicationResponseDto submitDeliverable(String creatorPhone, Long applicationId, DeliverableSubmissionDto req) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));

        if (!application.getCreator().getPhone().equals(creatorPhone)) {
            throw new AccessDeniedException("Not authorized to submit deliverables for this application");
        }

        application.setDeliverableUrl(req.getDeliverableUrl());
        application.setDeliverableNotes(req.getDeliverableNotes());
        application.setStatus(ApplicationStatus.DELIVERABLES_SUBMITTED);

        Application saved = applicationRepository.save(application);
        return toDto(saved);
    }

    public ApplicationResponseDto toDto(Application app) {
        Campaign campaign = app.getCampaign();
        User creator = app.getCreator();
        CreatorProfile cProfile = creatorProfileRepository.findByUserId(creator.getId()).orElse(null);
        MerchantProfile mProfile = merchantProfileRepository.findByUserId(campaign.getMerchant().getId()).orElse(null);

        String creatorName = cProfile != null && cProfile.getDisplayName() != null 
                ? cProfile.getDisplayName() 
                : "Creator " + creator.getId();
        String brandName = mProfile != null && mProfile.getBrandName() != null 
                ? mProfile.getBrandName() 
                : "Brand " + campaign.getMerchant().getId();

        return ApplicationResponseDto.builder()
                .id(app.getId())
                .campaignId(campaign.getId())
                .campaignTitle(campaign.getTitle())
                .campaignCategory(campaign.getCategory())
                .campaignBudget(campaign.getBudget())
                .campaignTargetCity(campaign.getTargetCity())
                .merchantId(campaign.getMerchant().getId())
                .merchantBrandName(brandName)
                .merchantLogoUrl(mProfile != null ? mProfile.getLogoUrl() : null)
                .creatorId(creator.getId())
                .creatorName(creatorName)
                .creatorPhone(creator.getPhone())
                .creatorEmail(creator.getEmail())
                .creatorAvatarUrl(cProfile != null ? cProfile.getAvatarUrl() : null)
                .creatorCity(cProfile != null ? cProfile.getCity() : null)
                .creatorTotalFollowers(cProfile != null ? cProfile.getTotalFollowers() : 0L)
                .creatorCategories(cProfile != null ? cProfile.getCategories() : null)
                .creatorInstagramHandle(cProfile != null ? cProfile.getInstagramHandle() : null)
                .pitch(app.getPitch())
                .proposedRate(app.getProposedRate())
                .status(app.getStatus())
                .deliverableUrl(app.getDeliverableUrl())
                .deliverableNotes(app.getDeliverableNotes())
                .paymentStatus(app.getPaymentStatus())
                .merchantFeedback(app.getMerchantFeedback())
                .creatorFeedback(app.getCreatorFeedback())
                .rating(app.getRating())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}

