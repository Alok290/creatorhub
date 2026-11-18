package com.creatorhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "campaign_applications", uniqueConstraints = {
    @UniqueConstraint(name = "uk_campaign_creator", columnNames = {"campaign_id", "creator_user_id"})
}, indexes = {
    @Index(name = "idx_app_status", columnList = "status"),
    @Index(name = "idx_app_creator", columnList = "creator_user_id"),
    @Index(name = "idx_app_campaign", columnList = "campaign_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_user_id", nullable = false)
    private User creator;

    @Column(length = 1500)
    private String pitch;

    @Column(name = "proposed_rate")
    private Double proposedRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "deliverable_url", length = 500)
    private String deliverableUrl;

    @Column(name = "deliverable_notes", length = 1500)
    private String deliverableNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "merchant_feedback", length = 1000)
    private String merchantFeedback;

    @Column(name = "creator_feedback", length = 1000)
    private String creatorFeedback;

    private Integer rating;

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
            this.status = ApplicationStatus.APPLIED;
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}

