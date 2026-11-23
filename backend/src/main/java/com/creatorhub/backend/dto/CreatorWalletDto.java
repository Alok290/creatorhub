package com.creatorhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorWalletDto {
    private BigDecimal lifetimeEarnings;
    private BigDecimal inEscrow;
    private BigDecimal totalWithdrawn;
    private BigDecimal availableBalance;
    private List<PaymentResponseDto> recentEscrowDeals;
    private List<PayoutResponseDto> recentPayouts;
}
