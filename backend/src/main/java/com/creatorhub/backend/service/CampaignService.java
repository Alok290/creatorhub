package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.CampaignRequestDto;
import com.creatorhub.backend.dto.CampaignResponseDto;
import com.creatorhub.backend.entity.Campaign;
import com.creatorhub.backend.entity.CampaignStatus;
import com.creatorhub.backend.entity.MerchantProfile;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.ApplicationRepository;
import com.creatorhub.backend.repository.CampaignRepository;
import com.creatorhub.backend.repository.MerchantProfileRepository;
import com.creatorhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final MerchantProfileRepository merchantProfileRepository;

    @Transactional
    public CampaignResponseDto createCampaign(String merchantPhone, CampaignRequestDto req) {
        User merchant = userRepository.findByPhone(merchantPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Merchant not found: " + merchantPhone));

        if (merchant.getRole() != Role.MERCHANT) {
            throw new AccessDeniedException("Only merchants can create campaigns");
        }

        Campaign campaign = Campaign.builder()
                .merchant(merchant)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .compensationType(req.getCompensationType())
                .budget(req.getBudget())
                .deliverables(req.getDeliverables())
                .minFollowers(req.getMinFollowers() != null ? req.getMinFollowers() : 0)
                .targetCity(req.getTargetCity())
                .targetLatitude(req.getTargetLatitude())
                .targetLongitude(req.getTargetLongitude())
                .radiusKm(req.getRadiusKm())
                .deadline(req.getDeadline())
                .status(CampaignStatus.ACTIVE)
                .build();

        Campaign saved = campaignRepository.save(campaign);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponseDto> getMerchantCampaigns(String merchantPhone) {
        return campaignRepository.findByMerchantPhoneOrderByCreatedAtDesc(merchantPhone)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponseDto getCampaignDetails(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));
        return toDto(campaign);
    }

    @Transactional
    public CampaignResponseDto updateCampaign(String merchantPhone, Long id, CampaignRequestDto req) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));

        if (!campaign.getMerchant().getPhone().equals(merchantPhone)) {
            throw new AccessDeniedException("You are not authorized to update this campaign");
        }

        campaign.setTitle(req.getTitle());
        campaign.setDescription(req.getDescription());
        campaign.setCategory(req.getCategory());
        campaign.setCompensationType(req.getCompensationType());
        campaign.setBudget(req.getBudget());
        campaign.setDeliverables(req.getDeliverables());
        if (req.getMinFollowers() != null) campaign.setMinFollowers(req.getMinFollowers());
        campaign.setTargetCity(req.getTargetCity());
        campaign.setTargetLatitude(req.getTargetLatitude());
        campaign.setTargetLongitude(req.getTargetLongitude());
        campaign.setRadiusKm(req.getRadiusKm());
        campaign.setDeadline(req.getDeadline());

        Campaign saved = campaignRepository.save(campaign);
        return toDto(saved);
    }

    @Transactional
    public CampaignResponseDto updateCampaignStatus(String merchantPhone, Long id, CampaignStatus status) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));

        if (!campaign.getMerchant().getPhone().equals(merchantPhone)) {
            throw new AccessDeniedException("You are not authorized to update this campaign");
        }

        campaign.setStatus(status);
        Campaign saved = campaignRepository.save(campaign);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponseDto> searchActiveCampaigns(String category, String city, Double minBudget, String search) {
        return campaignRepository.searchActiveCampaigns(CampaignStatus.ACTIVE, category, city, minBudget, search)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public CampaignResponseDto toDto(Campaign campaign) {
        MerchantProfile merchantProfile = merchantProfileRepository.findByUserId(campaign.getMerchant().getId()).orElse(null);
        int appCount = applicationRepository.countByCampaignId(campaign.getId());

        String brandName = merchantProfile != null && merchantProfile.getBrandName() != null 
                ? merchantProfile.getBrandName() 
                : "Brand #" + campaign.getMerchant().getId();
        String compName = merchantProfile != null ? merchantProfile.getCompanyName() : null;
        String logoUrl = merchantProfile != null ? merchantProfile.getLogoUrl() : null;
        String mCity = merchantProfile != null ? merchantProfile.getCity() : null;

        return CampaignResponseDto.builder()
                .id(campaign.getId())
                .merchantId(campaign.getMerchant().getId())
                .merchantBrandName(brandName)
                .merchantCompanyName(compName)
                .merchantLogoUrl(logoUrl)
                .merchantCity(mCity)
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .category(campaign.getCategory())
                .compensationType(campaign.getCompensationType())
                .budget(campaign.getBudget())
                .deliverables(campaign.getDeliverables())
                .minFollowers(campaign.getMinFollowers())
                .targetCity(campaign.getTargetCity())
                .targetLatitude(campaign.getTargetLatitude())
                .targetLongitude(campaign.getTargetLongitude())
                .radiusKm(campaign.getRadiusKm())
                .deadline(campaign.getDeadline())
                .status(campaign.getStatus())
                .applicationCount(appCount)
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .build();
    }
}

