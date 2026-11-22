package com.creatorhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatThreadDto {
    private Long applicationId;
    private Long campaignId;
    private String campaignTitle;
    private String partnerName;
    private String partnerAvatarUrl;
    private String partnerRole;
    private String partnerPhone;
    private String lastMessage;
    private Instant lastMessageAt;
    private long unreadCount;
    private String status;
}
