package com.creatorhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "merchant_profiles", indexes = {
    @Index(name = "idx_merchant_city", columnList = "city"),
    @Index(name = "idx_merchant_industry", columnList = "industry")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "brand_name", length = 150)
    private String brandName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 255)
    private String website;

    @Column(length = 100)
    private String industry;

    @Column(length = 1500)
    private String description;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    private Double latitude;

    private Double longitude;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}

