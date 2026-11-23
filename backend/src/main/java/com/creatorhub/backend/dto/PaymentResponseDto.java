package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    private Long id;
    private String transactionId;
    private Long applicationId;
    private String campaignTitle;
    private Long payerId;
    private String payerName;
    private Long recipientId;
    private String recipientName;
    private BigDecimal grossAmount;
    private BigDecimal platformFee;
    private BigDecimal netAmount;
    private String currency;
    private String gatewayName;
    private String gatewayPaymentId;
    private PaymentStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
