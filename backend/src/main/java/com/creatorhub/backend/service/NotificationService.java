package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.NotificationDto;
import com.creatorhub.backend.entity.*;
import com.creatorhub.backend.repository.CreatorProfileRepository;
import com.creatorhub.backend.repository.MerchantProfileRepository;
import com.creatorhub.backend.repository.NotificationRepository;
import com.creatorhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final MerchantProfileRepository merchantProfileRepository;

    @Transactional
    public void sendNotification(
            User recipient,
            User sender,
            String title,
            String message,
            NotificationType type,
            Long referenceId,
            String linkUrl
    ) {
        if (recipient == null) {
            log.warn("Cannot send notification: recipient is null");
            return;
        }

        // Avoid self-notifications
        if (sender != null && sender.getId().equals(recipient.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .linkUrl(linkUrl != null ? linkUrl : "/")
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification saved for user ID {}: {}", recipient.getId(), title);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(String userPhone) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        List<Notification> notifications = notificationRepository.findTop30ByRecipientIdOrderByCreatedAtDesc(user.getId());
        return notifications.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userPhone) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(String userPhone, Long notificationId) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        notificationRepository.markAsRead(notificationId, user.getId());
    }

    @Transactional
    public void markAllAsRead(String userPhone) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userPhone));

        notificationRepository.markAllAsRead(user.getId());
    }

    private NotificationDto toDto(Notification n) {
        String senderName = null;
        String senderAvatarUrl = null;

        if (n.getSender() != null) {
            User s = n.getSender();
            if (s.getRole() == Role.MERCHANT) {
                MerchantProfile mp = merchantProfileRepository.findByUserId(s.getId()).orElse(null);
                if (mp != null) {
                    senderName = mp.getBrandName();
                    senderAvatarUrl = mp.getLogoUrl();
                } else {
                    senderName = "Brand Partner";
                }
            } else {
                CreatorProfile cp = creatorProfileRepository.findByUserId(s.getId()).orElse(null);
                if (cp != null) {
                    senderName = cp.getDisplayName();
                    senderAvatarUrl = cp.getAvatarUrl();
                } else {
                    senderName = "Creator Partner";
                }
            }
        }

        return NotificationDto.builder()
                .id(n.getId())
                .recipientId(n.getRecipient().getId())
                .senderId(n.getSender() != null ? n.getSender().getId() : null)
                .senderName(senderName)
                .senderAvatarUrl(senderAvatarUrl)
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .referenceId(n.getReferenceId())
                .linkUrl(n.getLinkUrl())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
