package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.PayoutMethod;
import com.creatorhub.backend.entity.PayoutStatus;
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
public class PayoutResponseDto {
    private Long id;
    private Long creatorId;
    private BigDecimal amount;
    private PayoutMethod payoutMethod;
    private String upiId;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private PayoutStatus status;
    private String utrNumber;
    private Instant processedAt;
    private Instant createdAt;
}
