package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.*;
import com.creatorhub.backend.entity.ApplicationStatus;
import com.creatorhub.backend.repository.ApplicationRepository;
import com.creatorhub.backend.repository.CampaignRepository;
import com.creatorhub.backend.service.ApplicationService;
import com.creatorhub.backend.service.CampaignService;
import com.creatorhub.backend.service.CreatorProfileService;
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
@RequestMapping("/api/v1/creators")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_CREATOR')")
public class CreatorController {

    private final CreatorProfileService creatorProfileService;
    private final CampaignService campaignService;
    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final CampaignRepository campaignRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCreatorDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String phone = userDetails.getUsername();
        CreatorProfileDto profile = creatorProfileService.getOrCreateProfile(phone);
        List<ApplicationResponseDto> applications = applicationService.getCreatorApplications(phone);

        long activeCollabs = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED || a.getStatus() == ApplicationStatus.IN_PROGRESS || a.getStatus() == ApplicationStatus.DELIVERABLES_SUBMITTED)
                .count();

        long completedCollabs = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.COMPLETED)
                .count();

        double totalEarnings = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.COMPLETED && a.getProposedRate() != null)
                .mapToDouble(ApplicationResponseDto::getProposedRate)
                .sum();

        Map<String, Object> data = new HashMap<>();
        data.put("profile", profile);
        data.put("totalApplications", applications.size());
        data.put("activeCollaborations", activeCollabs);
        data.put("completedCollaborations", completedCollabs);
        data.put("totalEarnings", totalEarnings);
        data.put("recentApplications", applications.stream().limit(5).toList());

        return ResponseEntity.ok(ApiResponse.success(data, "Creator dashboard loaded"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CreatorProfileDto profile = creatorProfileService.getOrCreateProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreatorProfileUpdateRequest request
    ) {
        CreatorProfileDto updated = creatorProfileService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponseDto>>> exploreCampaigns(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minBudget,
            @RequestParam(required = false) String search
    ) {
        List<CampaignResponseDto> campaigns = campaignService.searchActiveCampaigns(category, city, minBudget, search);
        return ResponseEntity.ok(ApiResponse.success(campaigns, "Campaigns retrieved"));
    }

    @GetMapping("/campaigns/{id}")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> getCampaignDetails(@PathVariable Long id) {
        CampaignResponseDto campaign = campaignService.getCampaignDetails(id);
        return ResponseEntity.ok(ApiResponse.success(campaign, "Campaign details retrieved"));
    }

    @PostMapping("/campaigns/{id}/apply")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> applyToCampaign(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequestDto request
    ) {
        ApplicationResponseDto app = applicationService.apply(userDetails.getUsername(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(app, "Application submitted successfully"));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ApplicationResponseDto> apps = applicationService.getCreatorApplications(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(apps, "Applications retrieved"));
    }

    @PostMapping("/applications/{id}/deliverable")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> submitDeliverable(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody DeliverableSubmissionDto request
    ) {
        ApplicationResponseDto app = applicationService.submitDeliverable(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(app, "Deliverable submitted successfully"));
    }
}
