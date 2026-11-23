package com.creatorhub.backend.dto;

import com.creatorhub.backend.entity.PayoutMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestPayoutDto {

    @NotNull(message = "Payout amount is required")
    @DecimalMin(value = "100.00", message = "Minimum withdrawal amount is ₹100")
    private BigDecimal amount;

    @NotNull(message = "Payout method is required (UPI or BANK_TRANSFER)")
    private PayoutMethod payoutMethod;

    private String upiId;

    private String accountNumber;

    private String ifscCode;

    private String accountHolderName;
}
