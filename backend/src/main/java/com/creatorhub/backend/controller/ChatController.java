package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.ApiResponse;
import com.creatorhub.backend.dto.ChatMessageDto;
import com.creatorhub.backend.dto.ChatThreadDto;
import com.creatorhub.backend.dto.SendMessageRequestDto;
import com.creatorhub.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/applications/{applicationId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId
    ) {
        List<ChatMessageDto> messages = chatService.getMessages(userDetails.getUsername(), applicationId);
        return ResponseEntity.ok(ApiResponse.success(messages, "Messages retrieved"));
    }

    @PostMapping("/applications/{applicationId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId,
            @Valid @RequestBody SendMessageRequestDto request
    ) {
        ChatMessageDto message = chatService.sendMessage(userDetails.getUsername(), applicationId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success(message, "Message sent"));
    }

    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<ChatThreadDto>>> getChatThreads(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ChatThreadDto> threads = chatService.getChatThreads(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(threads, "Chat threads retrieved"));
    }
}
