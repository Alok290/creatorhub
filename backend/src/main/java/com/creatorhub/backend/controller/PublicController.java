package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.ApiResponse;
import com.creatorhub.backend.dto.CampaignResponseDto;
import com.creatorhub.backend.dto.CreatorProfileDto;
import com.creatorhub.backend.entity.CampaignStatus;
import com.creatorhub.backend.entity.Role;
import com.creatorhub.backend.repository.CampaignRepository;
import com.creatorhub.backend.repository.CreatorProfileRepository;
import com.creatorhub.backend.repository.UserRepository;
import com.creatorhub.backend.service.CampaignService;
import com.creatorhub.backend.service.CreatorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final CampaignService campaignService;
    private final CreatorProfileService creatorProfileService;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;

    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponseDto>>> getFeaturedCampaigns(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city
    ) {
        List<CampaignResponseDto> list = campaignService.searchActiveCampaigns(category, city, null, null);
        return ResponseEntity.ok(ApiResponse.success(list.stream().limit(8).toList(), "Public campaigns retrieved"));
    }

    @GetMapping("/creators")
    public ResponseEntity<ApiResponse<List<CreatorProfileDto>>> getFeaturedCreators(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city
    ) {
        List<CreatorProfileDto> list = creatorProfileService.searchCreators(category, city, null, null);
        return ResponseEntity.ok(ApiResponse.success(list.stream().limit(8).toList(), "Public creators retrieved"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStats() {
        long totalCreators = creatorProfileRepository.count();
        long activeCampaigns = campaignRepository.findAll().stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();
        long totalUsers = userRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCreators", totalCreators);
        stats.put("activeCampaigns", activeCampaigns);
        stats.put("totalUsers", totalUsers);

        return ResponseEntity.ok(ApiResponse.success(stats, "Platform stats loaded"));
    }
}

