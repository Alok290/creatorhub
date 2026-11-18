package com.creatorhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "campaigns", indexes = {
    @Index(name = "idx_campaigns_status", columnList = "status"),
    @Index(name = "idx_campaigns_category", columnList = "category"),
    @Index(name = "idx_campaigns_target_city", columnList = "target_city")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "merchant_user_id", nullable = false)
    private User merchant;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 3000)
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "compensation_type", nullable = false, length = 30)
    @Builder.Default
    private CompensationType compensationType = CompensationType.PAID;

    @Column(nullable = false)
    @Builder.Default
    private Double budget = 0.0;

    @Column(length = 1000)
    private String deliverables;

    @Column(name = "min_followers")
    @Builder.Default
    private Integer minFollowers = 0;

    @Column(name = "target_city", length = 100)
    private String targetCity;

    @Column(name = "target_latitude")
    private Double targetLatitude;

    @Column(name = "target_longitude")
    private Double targetLongitude;

    @Column(name = "radius_km")
    private Double radiusKm;

    private Instant deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = CampaignStatus.ACTIVE;
        }
        if (this.compensationType == null) {
            this.compensationType = CompensationType.PAID;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}

