package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.ChatMessageDto;
import com.creatorhub.backend.dto.ChatThreadDto;
import com.creatorhub.backend.entity.*;
import com.creatorhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final NotificationService notificationService;

    @Transactional
    public List<ChatMessageDto> getMessages(String userPhone, Long applicationId) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Collaboration not found: " + applicationId));

        boolean isCreator = application.getCreator().getId().equals(user.getId());
        boolean isMerchant = application.getCampaign().getMerchant().getId().equals(user.getId());

        if (!isCreator && !isMerchant) {
            throw new AccessDeniedException("You are not authorized to view messages for this collaboration");
        }

        // Mark incoming messages from the other participant as read
        chatMessageRepository.markAllAsRead(applicationId, user.getId());

        List<ChatMessage> messages = chatMessageRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId);
        return messages.stream().map(m -> toDto(m, user.getId())).toList();
    }

    @Transactional
    public ChatMessageDto sendMessage(String userPhone, Long applicationId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Collaboration not found: " + applicationId));

        boolean isCreator = application.getCreator().getId().equals(user.getId());
        boolean isMerchant = application.getCampaign().getMerchant().getId().equals(user.getId());

        if (!isCreator && !isMerchant) {
            throw new AccessDeniedException("You are not authorized to post messages in this collaboration");
        }

        ChatMessage message = ChatMessage.builder()
                .application(application)
                .sender(user)
                .content(content.trim())
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        User recipient = isCreator ? application.getCampaign().getMerchant() : application.getCreator();
        String senderName = isCreator
                ? creatorProfileRepository.findByUserId(user.getId()).map(CreatorProfile::getDisplayName).orElse("Creator")
                : merchantProfileRepository.findByUserId(user.getId()).map(MerchantProfile::getBrandName).orElse("Brand");

        notificationService.sendNotification(
                recipient,
                user,
                "New Message from " + senderName,
                content.length() > 80 ? content.substring(0, 77) + "..." : content,
                NotificationType.CHAT_MESSAGE,
                application.getId(),
                "/messages"
        );

        return toDto(saved, user.getId());
    }

    @Transactional(readOnly = true)
    public List<ChatThreadDto> getChatThreads(String userPhone) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        List<Application> applications;
        if (user.getRole() == Role.MERCHANT) {
            applications = applicationRepository.findByCampaignMerchantPhoneOrderByCreatedAtDesc(userPhone);
        } else {
            applications = applicationRepository.findByCreatorPhoneOrderByCreatedAtDesc(userPhone);
        }

        return applications.stream().map(app -> {
            boolean isUserMerchant = user.getRole() == Role.MERCHANT;
            String partnerName;
            String partnerAvatar;
            String partnerRole;
            String partnerPhone;

            if (isUserMerchant) {
                // Partner is the creator
                CreatorProfile cProfile = creatorProfileRepository.findByUserId(app.getCreator().getId()).orElse(null);
                partnerName = cProfile != null && cProfile.getDisplayName() != null ? cProfile.getDisplayName() : "Creator " + app.getCreator().getId();
                partnerAvatar = cProfile != null ? cProfile.getAvatarUrl() : null;
                partnerRole = "CREATOR";
                partnerPhone = app.getCreator().getPhone();
            } else {
                // Partner is the merchant
                MerchantProfile mProfile = merchantProfileRepository.findByUserId(app.getCampaign().getMerchant().getId()).orElse(null);
                partnerName = mProfile != null && mProfile.getBrandName() != null ? mProfile.getBrandName() : "Brand " + app.getCampaign().getMerchant().getId();
                partnerAvatar = mProfile != null ? mProfile.getLogoUrl() : null;
                partnerRole = "MERCHANT";
                partnerPhone = app.getCampaign().getMerchant().getPhone();
            }

            Optional<ChatMessage> latest = chatMessageRepository.findTopByApplicationIdOrderByCreatedAtDesc(app.getId());
            long unread = chatMessageRepository.countByApplicationIdAndSenderIdNotAndIsReadFalse(app.getId(), user.getId());

            String lastMessageText = latest.map(ChatMessage::getContent).orElse(
                    app.getPitch() != null ? "Proposal: " + app.getPitch() : "Collaboration started"
            );
            Instant lastActivityTime = latest.map(ChatMessage::getCreatedAt).orElse(app.getCreatedAt());

            return ChatThreadDto.builder()
                    .applicationId(app.getId())
                    .campaignId(app.getCampaign().getId())
                    .campaignTitle(app.getCampaign().getTitle())
                    .partnerName(partnerName)
                    .partnerAvatarUrl(partnerAvatar)
                    .partnerRole(partnerRole)
                    .partnerPhone(partnerPhone)
                    .lastMessage(lastMessageText)
                    .lastMessageAt(lastActivityTime)
                    .unreadCount(unread)
                    .status(app.getStatus().name())
                    .build();
        })
        .sorted(Comparator.comparing(ChatThreadDto::getLastMessageAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .toList();
    }

    private ChatMessageDto toDto(ChatMessage m, Long currentUserId) {
        User sender = m.getSender();
        String senderName = "User " + sender.getId();
        String senderAvatar = null;

        if (sender.getRole() == Role.MERCHANT) {
            MerchantProfile mProfile = merchantProfileRepository.findByUserId(sender.getId()).orElse(null);
            if (mProfile != null && mProfile.getBrandName() != null) {
                senderName = mProfile.getBrandName();
                senderAvatar = mProfile.getLogoUrl();
            }
        } else {
            CreatorProfile cProfile = creatorProfileRepository.findByUserId(sender.getId()).orElse(null);
            if (cProfile != null && cProfile.getDisplayName() != null) {
                senderName = cProfile.getDisplayName();
                senderAvatar = cProfile.getAvatarUrl();
            }
        }

        return ChatMessageDto.builder()
                .id(m.getId())
                .applicationId(m.getApplication().getId())
                .senderId(sender.getId())
                .senderName(senderName)
                .senderRole(sender.getRole().name())
                .senderAvatarUrl(senderAvatar)
                .content(m.getContent())
                .isRead(m.isRead())
                .createdAt(m.getCreatedAt())
                .isMine(sender.getId().equals(currentUserId))
                .build();
    }
}
