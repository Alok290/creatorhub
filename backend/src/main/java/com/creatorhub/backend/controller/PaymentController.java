package com.creatorhub.backend.controller;

import com.creatorhub.backend.dto.*;
import com.creatorhub.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<PaymentOrderResponseDto>> createEscrowOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long applicationId
    ) {
        PaymentOrderResponseDto order = paymentService.createEscrowOrder(userDetails.getUsername(), applicationId);
        return ResponseEntity.ok(ApiResponse.success(order, "Escrow order created successfully"));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequestDto request
    ) {
        PaymentResponseDto payment = paymentService.verifyAndEscrowPayment(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(payment, "Payment verified and funds safely locked in escrow vault"));
    }

    @GetMapping("/merchant/history")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<List<PaymentResponseDto>>> getMerchantPaymentHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<PaymentResponseDto> history = paymentService.getMerchantPaymentHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(history, "Payment history retrieved"));
    }

    @GetMapping("/creator/wallet")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<CreatorWalletDto>> getCreatorWallet(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CreatorWalletDto wallet = paymentService.getCreatorWallet(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(wallet, "Creator wallet details retrieved"));
    }

    @PostMapping("/creator/withdraw")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<PayoutResponseDto>> requestPayout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RequestPayoutDto request
    ) {
        PayoutResponseDto payout = paymentService.requestPayout(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(payout, "Withdrawal processed successfully"));
    }

    @GetMapping("/creator/history")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<List<PaymentResponseDto>>> getCreatorPaymentHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<PaymentResponseDto> history = paymentService.getCreatorPaymentHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(history, "Creator deal earnings retrieved"));
    }
}
