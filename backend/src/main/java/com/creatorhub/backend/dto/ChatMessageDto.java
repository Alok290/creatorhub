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
public class ChatMessageDto {
    private Long id;
    private Long applicationId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String senderAvatarUrl;
    private String content;

    @JsonProperty("isRead")
    private boolean isRead;

    private Instant createdAt;

    @JsonProperty("isMine")
    private boolean isMine;

    @JsonProperty("isRead")
    public boolean isRead() {
        return isRead;
    }

    @JsonProperty("isMine")
    public boolean isMine() {
        return isMine;
    }

    @JsonProperty("read")
    public boolean getRead() {
        return isRead;
    }

    @JsonProperty("mine")
    public boolean getMine() {
        return isMine;
    }
}
