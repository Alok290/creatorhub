package com.creatorhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantProfileUpdateRequest {

    private String companyName;
    private String brandName;
    private String logoUrl;
    private String website;
    private String industry;
    private String description;
    private String address;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private String contactEmail;
}

