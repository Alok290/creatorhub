package com.creatorhub.backend.repository;

import com.creatorhub.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByApplicationIdOrderByCreatedAtAsc(Long applicationId);

    Optional<ChatMessage> findTopByApplicationIdOrderByCreatedAtDesc(Long applicationId);

    long countByApplicationIdAndSenderIdNotAndIsReadFalse(Long applicationId, Long senderId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.application.id = :appId AND m.sender.id <> :userId AND m.isRead = false")
    int markAllAsRead(@Param("appId") Long appId, @Param("userId") Long userId);
}
