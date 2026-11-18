package com.creatorhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorProfileUpdateRequest {

    private String displayName;
    private String bio;
    private String avatarUrl;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private String categories;
    private String instagramHandle;
    private Integer instagramFollowers;
    private String youtubeHandle;
    private Integer youtubeSubscribers;
    private String tiktokHandle;
    private Integer tiktokFollowers;
    private Double baseRate;
    private String portfolioLinks;
    private Boolean isAvailable;
}

