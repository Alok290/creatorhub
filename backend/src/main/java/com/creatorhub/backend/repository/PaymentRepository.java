package com.creatorhub.backend.repository;

import com.creatorhub.backend.entity.Payment;
import com.creatorhub.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByApplicationId(Long applicationId);

    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByPayerIdOrderByCreatedAtDesc(Long payerId);

    List<Payment> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    @Query("SELECT COALESCE(SUM(p.grossAmount), 0) FROM Payment p WHERE p.payer.id = :payerId AND p.status = :status")
    BigDecimal sumGrossAmountByPayerIdAndStatus(@Param("payerId") Long payerId, @Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payment p WHERE p.recipient.id = :recipientId AND p.status = :status")
    BigDecimal sumNetAmountByRecipientIdAndStatus(@Param("recipientId") Long recipientId, @Param("status") PaymentStatus status);

    long countByPayerIdAndStatus(Long payerId, PaymentStatus status);
}
