package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.CreatorProfileDto;
import com.creatorhub.backend.dto.CreatorProfileUpdateRequest;
import com.creatorhub.backend.entity.CreatorProfile;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.entity.User;
import com.creatorhub.backend.repository.CreatorProfileRepository;
import com.creatorhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CreatorProfileService {

    private final CreatorProfileRepository creatorProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreatorProfileDto getOrCreateProfile(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + phone));

        if (user.getRole() != Role.CREATOR) {
            throw new AccessDeniedException("User is not registered as a creator");
        }

        CreatorProfile profile = creatorProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CreatorProfile newProfile = CreatorProfile.builder()
                            .user(user)
                            .displayName(user.getEmail() != null ? user.getEmail().split("@")[0] : "Creator " + user.getId())
                            .isAvailable(true)
                            .build();
                    return creatorProfileRepository.save(newProfile);
                });

        return toDto(profile);
    }

    @Transactional
    public CreatorProfileDto updateProfile(String phone, CreatorProfileUpdateRequest req) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + phone));

        CreatorProfile profile = creatorProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CreatorProfile.builder().user(user).build());

        if (req.getDisplayName() != null) profile.setDisplayName(req.getDisplayName());
        if (req.getBio() != null) profile.setBio(req.getBio());
        if (req.getAvatarUrl() != null) profile.setAvatarUrl(req.getAvatarUrl());
        if (req.getCity() != null) profile.setCity(req.getCity());
        if (req.getCountry() != null) profile.setCountry(req.getCountry());
        if (req.getLatitude() != null) profile.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) profile.setLongitude(req.getLongitude());
        if (req.getCategories() != null) profile.setCategories(req.getCategories());
        if (req.getInstagramHandle() != null) profile.setInstagramHandle(req.getInstagramHandle());
        if (req.getInstagramFollowers() != null) profile.setInstagramFollowers(req.getInstagramFollowers());
        if (req.getYoutubeHandle() != null) profile.setYoutubeHandle(req.getYoutubeHandle());
        if (req.getYoutubeSubscribers() != null) profile.setYoutubeSubscribers(req.getYoutubeSubscribers());
        if (req.getTiktokHandle() != null) profile.setTiktokHandle(req.getTiktokHandle());
        if (req.getTiktokFollowers() != null) profile.setTiktokFollowers(req.getTiktokFollowers());
        if (req.getBaseRate() != null) profile.setBaseRate(req.getBaseRate());
        if (req.getPortfolioLinks() != null) profile.setPortfolioLinks(req.getPortfolioLinks());
        if (req.getIsAvailable() != null) profile.setAvailable(req.getIsAvailable());

        profile.recalculateTotalFollowers();
        CreatorProfile saved = creatorProfileRepository.save(profile);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CreatorProfileDto> searchCreators(String category, String city, Long minFollowers, String search) {
        return creatorProfileRepository.searchCreators(category, city, minFollowers, search)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CreatorProfileDto getPublicCreatorProfile(Long creatorUserId) {
        CreatorProfile profile = creatorProfileRepository.findByUserId(creatorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Creator profile not found for user id: " + creatorUserId));
        return toDto(profile);
    }

    public CreatorProfileDto toDto(CreatorProfile profile) {
        return CreatorProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .phone(profile.getUser().getPhone())
                .email(profile.getUser().getEmail())
                .displayName(profile.getDisplayName())
                .bio(profile.getBio())
                .avatarUrl(profile.getAvatarUrl())
                .city(profile.getCity())
                .country(profile.getCountry())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .categories(profile.getCategories())
                .instagramHandle(profile.getInstagramHandle())
                .instagramFollowers(profile.getInstagramFollowers())
                .youtubeHandle(profile.getYoutubeHandle())
                .youtubeSubscribers(profile.getYoutubeSubscribers())
                .tiktokHandle(profile.getTiktokHandle())
                .tiktokFollowers(profile.getTiktokFollowers())
                .baseRate(profile.getBaseRate())
                .totalFollowers(profile.getTotalFollowers())
                .portfolioLinks(profile.getPortfolioLinks())
                .isAvailable(profile.isAvailable())
                .build();
    }
}

