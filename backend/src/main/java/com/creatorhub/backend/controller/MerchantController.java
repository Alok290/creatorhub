package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.*;
import com.creatorhub.backend.entity.ApplicationStatus;
import com.creatorhub.backend.entity.CampaignStatus;
import com.creatorhub.backend.service.ApplicationService;
import com.creatorhub.backend.service.CampaignService;
import com.creatorhub.backend.service.CreatorProfileService;
import com.creatorhub.backend.service.MerchantProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/merchants")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_MERCHANT')")
public class MerchantController {

    private final MerchantProfileService merchantProfileService;
    private final CampaignService campaignService;
    private final ApplicationService applicationService;
    private final CreatorProfileService creatorProfileService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMerchantDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String phone = userDetails.getUsername();
        MerchantProfileDto profile = merchantProfileService.getOrCreateProfile(phone);
        List<CampaignResponseDto> campaigns = campaignService.getMerchantCampaigns(phone);
        List<ApplicationResponseDto> collabs = applicationService.getMerchantCollaborations(phone);

        long activeCollabs = collabs.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED || a.getStatus() == ApplicationStatus.IN_PROGRESS || a.getStatus() == ApplicationStatus.DELIVERABLES_SUBMITTED)
                .count();

        long pendingApps = collabs.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.APPLIED)
                .count();

        long completedCollabs = collabs.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.COMPLETED)
                .count();

        Map<String, Object> data = new HashMap<>();
        data.put("profile", profile);
        data.put("totalCampaigns", campaigns.size());
        data.put("pendingApplications", pendingApps);
        data.put("activeCollaborations", activeCollabs);
        data.put("completedCollaborations", completedCollabs);
        data.put("recentCampaigns", campaigns.stream().limit(5).toList());
        data.put("recentApplications", collabs.stream().limit(5).toList());

        return ResponseEntity.ok(ApiResponse.success(data, "Merchant dashboard loaded"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<MerchantProfileDto>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        MerchantProfileDto profile = merchantProfileService.getOrCreateProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<MerchantProfileDto>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MerchantProfileUpdateRequest request
    ) {
        MerchantProfileDto updated = merchantProfileService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> createCampaign(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CampaignRequestDto request
    ) {
        CampaignResponseDto campaign = campaignService.createCampaign(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(campaign, "Campaign created successfully"));
    }

    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponseDto>>> getMyCampaigns(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<CampaignResponseDto> campaigns = campaignService.getMerchantCampaigns(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(campaigns, "Campaigns retrieved"));
    }

    @GetMapping("/campaigns/{id}")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> getCampaignDetails(
            @PathVariable Long id
    ) {
        CampaignResponseDto campaign = campaignService.getCampaignDetails(id);
        return ResponseEntity.ok(ApiResponse.success(campaign, "Campaign details retrieved"));
    }

    @PutMapping("/campaigns/{id}")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> updateCampaign(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequestDto request
    ) {
        CampaignResponseDto updated = campaignService.updateCampaign(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Campaign updated successfully"));
    }

    @PutMapping("/campaigns/{id}/status")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> updateCampaignStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam CampaignStatus status
    ) {
        CampaignResponseDto updated = campaignService.updateCampaignStatus(userDetails.getUsername(), id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Campaign status updated"));
    }

    @GetMapping("/campaigns/{id}/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getCampaignApplications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        List<ApplicationResponseDto> apps = applicationService.getCampaignApplications(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(apps, "Applications retrieved"));
    }

    @GetMapping("/collaborations")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getAllCollaborations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ApplicationResponseDto> collabs = applicationService.getMerchantCollaborations(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(collabs, "Collaborations retrieved"));
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> updateApplicationStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateDto request
    ) {
        ApplicationResponseDto app = applicationService.updateApplicationStatus(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(app, "Application status updated"));
    }

    @GetMapping("/creators")
    public ResponseEntity<ApiResponse<List<CreatorProfileDto>>> searchCreators(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long minFollowers,
            @RequestParam(required = false) String search
    ) {
        List<CreatorProfileDto> creators = creatorProfileService.searchCreators(category, city, minFollowers, search);
        return ResponseEntity.ok(ApiResponse.success(creators, "Creators retrieved"));
    }

    @GetMapping("/creators/{userId}")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> getCreatorProfile(
            @PathVariable Long userId
    ) {
        CreatorProfileDto creator = creatorProfileService.getPublicCreatorProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(creator, "Creator details retrieved"));
    }
}
