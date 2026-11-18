package com.creatorhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstagramProfileDto {

    private String id;
    private String username;
    private String name;
    private String profilePictureUrl;
    private Integer followersCount;
    private Integer followsCount;
    private Integer mediaCount;
    private String biography;
    private String website;
}

