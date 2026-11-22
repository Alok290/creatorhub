package com.creatorhub.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private String linkUrl;

    @JsonProperty("isRead")
    private boolean isRead;

    private Instant createdAt;
}
