package com.creatorhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponseDto {
    private String keyId;
    private String orderId;
    private String transactionId;
    private Long applicationId;
    private String collabTitle;
    private String creatorName;
    private BigDecimal grossAmount;
    private BigDecimal platformFee;
    private BigDecimal netAmount;
    private String currency;
    private String brandName;
    private String userPhone;
    private String userEmail;
}
