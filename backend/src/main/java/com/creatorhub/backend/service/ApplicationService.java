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
    private final NotificationService notificationService;

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

        CreatorProfile cProfile = creatorProfileRepository.findByUserId(creator.getId()).orElse(null);
        String creatorName = cProfile != null && cProfile.getDisplayName() != null ? cProfile.getDisplayName() : "A creator";
        notificationService.sendNotification(
                campaign.getMerchant(),
                creator,
                "New Collab Proposal!",
                creatorName + " applied to your collab '" + campaign.getTitle() + "' with proposed fee ₹" + (saved.getProposedRate() != null ? saved.getProposedRate() : 0),
                NotificationType.APPLICATION_RECEIVED,
                saved.getId(),
                "/merchant/campaigns/" + campaign.getId()
        );

        return toDto(saved);
    }

    @Transactional
    public ApplicationResponseDto inviteCreator(String merchantPhone, Long campaignId, Long creatorUserId, Double proposedRate, String message) {
        User merchant = userRepository.findByPhone(merchantPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Merchant not found: " + merchantPhone));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        if (!campaign.getMerchant().getId().equals(merchant.getId())) {
            throw new AccessDeniedException("You do not own this collab");
        }

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Creator not found with user id: " + creatorUserId));

        if (applicationRepository.existsByCampaignIdAndCreatorId(campaignId, creator.getId())) {
            throw new IllegalArgumentException("An application or invitation already exists for this creator on this collab");
        }

        Application application = Application.builder()
                .campaign(campaign)
                .creator(creator)
                .pitch(message != null && !message.isBlank() ? "Merchant Direct Invitation: " + message : "Direct collaboration invitation from " + campaign.getMerchant().getPhone())
                .proposedRate(proposedRate != null ? proposedRate : campaign.getBudget())
                .status(ApplicationStatus.ACCEPTED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);

        MerchantProfile mProfile = merchantProfileRepository.findByUserId(merchant.getId()).orElse(null);
        String brandName = mProfile != null && mProfile.getBrandName() != null ? mProfile.getBrandName() : "A brand partner";
        notificationService.sendNotification(
                creator,
                merchant,
                "Collab Invitation 🤝",
                brandName + " invited you to collaborate on '" + campaign.getTitle() + "'" + (proposedRate != null ? " with offer ₹" + proposedRate : ""),
                NotificationType.COLLAB_INVITE,
                saved.getId(),
                "/creator/applications"
        );

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

        MerchantProfile mProfile = merchantProfileRepository.findByUserId(application.getCampaign().getMerchant().getId()).orElse(null);
        String brandName = mProfile != null && mProfile.getBrandName() != null ? mProfile.getBrandName() : "Brand";

        if (req.getStatus() == ApplicationStatus.ACCEPTED) {
            notificationService.sendNotification(
                    application.getCreator(),
                    application.getCampaign().getMerchant(),
                    "Proposal Accepted! 🎉",
                    brandName + " accepted your proposal for '" + application.getCampaign().getTitle() + "'. You can now coordinate deliverables!",
                    NotificationType.APPLICATION_ACCEPTED,
                    application.getId(),
                    "/creator/applications"
            );
        } else if (req.getStatus() == ApplicationStatus.REJECTED) {
            notificationService.sendNotification(
                    application.getCreator(),
                    application.getCampaign().getMerchant(),
                    "Proposal Update",
                    brandName + " declined your proposal for '" + application.getCampaign().getTitle() + "'.",
                    NotificationType.APPLICATION_REJECTED,
                    application.getId(),
                    "/creator/applications"
            );
        } else if (req.getStatus() == ApplicationStatus.CHANGES_REQUESTED) {
            String feedbackNote = req.getFeedback() != null && !req.getFeedback().isBlank()
                    ? ": \"" + (req.getFeedback().length() > 60 ? req.getFeedback().substring(0, 57) + "..." : req.getFeedback()) + "\""
                    : ". Please check feedback instructions and submit revised proof.";
            notificationService.sendNotification(
                    application.getCreator(),
                    application.getCampaign().getMerchant(),
                    "Revisions Requested ⚠️",
                    brandName + " requested improvements for '" + application.getCampaign().getTitle() + "'" + feedbackNote,
                    NotificationType.CHANGES_REQUESTED,
                    application.getId(),
                    "/creator/applications"
            );
        } else if (req.getStatus() == ApplicationStatus.COMPLETED) {
            String starTxt = req.getRating() != null ? " and rated your work " + req.getRating() + " stars!" : "!";
            notificationService.sendNotification(
                    application.getCreator(),
                    application.getCampaign().getMerchant(),
                    "Deal Completed & Rated ⭐",
                    brandName + " approved your post proof and marked the collab completed" + starTxt,
                    NotificationType.COLLAB_COMPLETED,
                    application.getId(),
                    "/creator/applications"
            );
        }

        return toDto(saved);
    }

    @Transactional
    public ApplicationResponseDto submitDeliverable(String creatorPhone, Long applicationId, DeliverableSubmissionDto req) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));

        if (!application.getCreator().getPhone().equals(creatorPhone)) {
            throw new AccessDeniedException("Not authorized to submit deliverables for this application");
        }

        boolean isRevision = application.getStatus() == ApplicationStatus.CHANGES_REQUESTED;
        application.setDeliverableUrl(req.getDeliverableUrl());
        application.setDeliverableNotes(req.getDeliverableNotes());
        application.setStatus(ApplicationStatus.DELIVERABLES_SUBMITTED);

        Application saved = applicationRepository.save(application);

        CreatorProfile cProfile = creatorProfileRepository.findByUserId(application.getCreator().getId()).orElse(null);
        String creatorName = cProfile != null && cProfile.getDisplayName() != null ? cProfile.getDisplayName() : "Creator";

        notificationService.sendNotification(
                application.getCampaign().getMerchant(),
                application.getCreator(),
                isRevision ? "Revised Deliverables Submitted 📸" : "Deliverables Submitted 📸",
                creatorName + (isRevision ? " submitted revised proof for '" : " submitted post proof for '") + application.getCampaign().getTitle() + "'. Review the link and approve.",
                NotificationType.DELIVERABLES_SUBMITTED,
                application.getId(),
                "/merchant/campaigns/" + application.getCampaign().getId()
        );

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

