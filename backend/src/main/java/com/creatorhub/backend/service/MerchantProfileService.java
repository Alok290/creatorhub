package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.MerchantProfileDto;
import com.creatorhub.backend.dto.MerchantProfileUpdateRequest;
import com.creatorhub.backend.entity.MerchantProfile;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.MerchantProfileRepository;
import com.creatorhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MerchantProfileService {

    private final MerchantProfileRepository merchantProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public MerchantProfileDto getOrCreateProfile(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + phone));

        if (user.getRole() != Role.MERCHANT) {
            throw new AccessDeniedException("User is not registered as a merchant");
        }

        MerchantProfile profile = merchantProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    MerchantProfile newProfile = MerchantProfile.builder()
                            .user(user)
                            .companyName("Business " + user.getId())
                            .brandName("Brand " + user.getId())
                            .build();
                    return merchantProfileRepository.save(newProfile);
                });

        return toDto(profile);
    }

    @Transactional
    public MerchantProfileDto updateProfile(String phone, MerchantProfileUpdateRequest req) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + phone));

        MerchantProfile profile = merchantProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> MerchantProfile.builder().user(user).build());

        if (req.getCompanyName() != null) profile.setCompanyName(req.getCompanyName());
        if (req.getBrandName() != null) profile.setBrandName(req.getBrandName());
        if (req.getLogoUrl() != null) profile.setLogoUrl(req.getLogoUrl());
        if (req.getWebsite() != null) profile.setWebsite(req.getWebsite());
        if (req.getIndustry() != null) profile.setIndustry(req.getIndustry());
        if (req.getDescription() != null) profile.setDescription(req.getDescription());
        if (req.getAddress() != null) profile.setAddress(req.getAddress());
        if (req.getCity() != null) profile.setCity(req.getCity());
        if (req.getCountry() != null) profile.setCountry(req.getCountry());
        if (req.getLatitude() != null) profile.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) profile.setLongitude(req.getLongitude());
        if (req.getContactEmail() != null) profile.setContactEmail(req.getContactEmail());

        MerchantProfile saved = merchantProfileRepository.save(profile);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public MerchantProfileDto getPublicMerchantProfile(Long merchantUserId) {
        MerchantProfile profile = merchantProfileRepository.findByUserId(merchantUserId)
                .orElseThrow(() -> new IllegalArgumentException("Merchant profile not found for user id: " + merchantUserId));
        return toDto(profile);
    }

    public MerchantProfileDto toDto(MerchantProfile profile) {
        return MerchantProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .phone(profile.getUser().getPhone())
                .email(profile.getUser().getEmail())
                .companyName(profile.getCompanyName())
                .brandName(profile.getBrandName())
                .logoUrl(profile.getLogoUrl())
                .website(profile.getWebsite())
                .industry(profile.getIndustry())
                .description(profile.getDescription())
                .address(profile.getAddress())
                .city(profile.getCity())
                .country(profile.getCountry())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .contactEmail(profile.getContactEmail())
                .build();
    }
}

