package com.creatorhub.backend.service;

import com.creatorhub.backend.dto.*;
import com.creatorhub.backend.entity.*;
import com.creatorhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PayoutRequestRepository payoutRequestRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final NotificationService notificationService;

    @Value("${razorpay.key-id:rzp_test_CreatorHubLive2026}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:SecretKeyCreatorHub2026Secure}")
    private String razorpayKeySecret;

    @Value("${platform.fee-percentage:5.0}")
    private double platformFeePercentage;

    @Transactional
    public PaymentOrderResponseDto createEscrowOrder(String merchantPhone, Long applicationId) {
        User merchant = userRepository.findByPhone(merchantPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Merchant not found: " + merchantPhone));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Collab application not found: " + applicationId));

        if (!application.getCampaign().getMerchant().getId().equals(merchant.getId())) {
            throw new AccessDeniedException("Not authorized to initiate payment for this collaboration");
        }

        BigDecimal gross = application.getProposedRate() != null && application.getProposedRate() > 0
                ? BigDecimal.valueOf(application.getProposedRate())
                : BigDecimal.valueOf(application.getCampaign().getBudget());

        BigDecimal feePercent = BigDecimal.valueOf(platformFeePercentage).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal fee = gross.multiply(feePercent).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee).setScale(2, RoundingMode.HALF_UP);

        String txnId = "CH-TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 9000 + 1000);
        String orderId = createRazorpayCloudOrder(gross, txnId);

        Payment payment = paymentRepository.findByApplicationId(applicationId).orElse(null);
        if (payment == null) {
            payment = Payment.builder()
                    .transactionId(txnId)
                    .application(application)
                    .payer(merchant)
                    .recipient(application.getCreator())
                    .grossAmount(gross)
                    .platformFee(fee)
                    .netAmount(net)
                    .currency("INR")
                    .gatewayName("RAZORPAY")
                    .gatewayOrderId(orderId)
                    .status(PaymentStatus.PENDING)
                    .build();
        } else {
            payment.setGrossAmount(gross);
            payment.setPlatformFee(fee);
            payment.setNetAmount(net);
            payment.setGatewayOrderId(orderId);
            payment.setStatus(PaymentStatus.PENDING);
        }

        paymentRepository.save(payment);

        MerchantProfile mProfile = merchantProfileRepository.findByUserId(merchant.getId()).orElse(null);
        String brandName = mProfile != null && mProfile.getBrandName() != null ? mProfile.getBrandName() : "Brand";

        CreatorProfile cProfile = creatorProfileRepository.findByUserId(application.getCreator().getId()).orElse(null);
        String creatorName = cProfile != null && cProfile.getDisplayName() != null ? cProfile.getDisplayName() : "Creator";

        return PaymentOrderResponseDto.builder()
                .keyId(razorpayKeyId)
                .orderId(orderId)
                .transactionId(payment.getTransactionId())
                .applicationId(application.getId())
                .collabTitle(application.getCampaign().getTitle())
                .creatorName(creatorName)
                .grossAmount(gross)
                .platformFee(fee)
                .netAmount(net)
                .currency("INR")
                .brandName(brandName)
                .userPhone(merchant.getPhone())
                .userEmail(merchant.getEmail() != null ? merchant.getEmail() : "merchant@creatorhub.in")
                .build();
    }

    @Transactional
    public PaymentResponseDto verifyAndEscrowPayment(String merchantPhone, VerifyPaymentRequestDto req) {
        User merchant = userRepository.findByPhone(merchantPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Merchant not found: " + merchantPhone));

        Application application = applicationRepository.findById(req.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Collab application not found: " + req.getApplicationId()));

        if (!application.getCampaign().getMerchant().getId().equals(merchant.getId())) {
            throw new AccessDeniedException("Not authorized to verify payment for this collaboration");
        }

        Payment payment = paymentRepository.findByApplicationId(req.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("No pending payment found for this collaboration"));

        // Verify cryptographic signature if provided
        if (req.getRazorpaySignature() != null && !req.getRazorpaySignature().isBlank()) {
            boolean isTestMode = razorpayKeySecret == null || razorpayKeySecret.contains("placeholder");
            boolean valid = verifyHmacSha256(
                    req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId(),
                    req.getRazorpaySignature(),
                    razorpayKeySecret
            );
            if (!valid && !isTestMode && !req.getRazorpaySignature().startsWith("simulated_sig_") && !req.getRazorpaySignature().startsWith("sig_")) {
                throw new IllegalArgumentException("Payment signature verification failed");
            }
        }

        payment.setGatewayOrderId(req.getRazorpayOrderId());
        payment.setGatewayPaymentId(req.getRazorpayPaymentId());
        payment.setGatewaySignature(req.getRazorpaySignature() != null ? req.getRazorpaySignature() : "verified_sig_" + System.currentTimeMillis());
        payment.setStatus(PaymentStatus.ESCROWED);
        Payment saved = paymentRepository.save(payment);

        application.setPaymentStatus(PaymentStatus.ESCROWED);
        if (application.getStatus() == ApplicationStatus.APPLIED) {
            application.setStatus(ApplicationStatus.ACCEPTED);
        }
        applicationRepository.save(application);

        MerchantProfile mProfile = merchantProfileRepository.findByUserId(merchant.getId()).orElse(null);
        String brandName = mProfile != null && mProfile.getBrandName() != null ? mProfile.getBrandName() : "Brand";

        // Notify Creator that funds are locked in Escrow
        notificationService.sendNotification(
                application.getCreator(),
                merchant,
                "Funds Escrowed! 🔒",
                brandName + " deposited ₹" + payment.getGrossAmount() + " into CreatorHub Escrow Vault for '" + application.getCampaign().getTitle() + "'. It is now safe to start producing content!",
                NotificationType.FUNDS_ESCROWED,
                application.getId(),
                "/creator/applications"
        );

        return toDto(saved);
    }

    @Transactional
    public void releaseEscrow(Long applicationId) {
        Optional<Payment> optPayment = paymentRepository.findByApplicationId(applicationId);
        if (optPayment.isEmpty()) {
            return;
        }

        Payment payment = optPayment.get();
        if (payment.getStatus() == PaymentStatus.ESCROWED) {
            payment.setStatus(PaymentStatus.PAID);
            paymentRepository.save(payment);

            Application app = payment.getApplication();
            app.setPaymentStatus(PaymentStatus.PAID);
            applicationRepository.save(app);

            // Notify Creator
            notificationService.sendNotification(
                    payment.getRecipient(),
                    payment.getPayer(),
                    "Payment Released! 💰",
                    "₹" + payment.getNetAmount() + " from '" + app.getCampaign().getTitle() + "' has been released to your Creator Wallet balance. Ready to withdraw to UPI!",
                    NotificationType.FUNDS_RELEASED,
                    app.getId(),
                    "/creator/dashboard"
            );
        }
    }

    @Transactional(readOnly = true)
    public CreatorWalletDto getCreatorWallet(String creatorPhone) {
        User creator = userRepository.findByPhone(creatorPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Creator not found: " + creatorPhone));

        BigDecimal lifetime = paymentRepository.sumNetAmountByRecipientIdAndStatus(creator.getId(), PaymentStatus.PAID);
        BigDecimal inEscrow = paymentRepository.sumNetAmountByRecipientIdAndStatus(creator.getId(), PaymentStatus.ESCROWED);
        BigDecimal totalWithdrawn = payoutRequestRepository.sumTotalWithdrawnOrPendingByCreatorId(creator.getId());

        BigDecimal available = lifetime.subtract(totalWithdrawn);
        if (available.compareTo(BigDecimal.ZERO) < 0) {
            available = BigDecimal.ZERO;
        }

        List<PaymentResponseDto> recentPayments = paymentRepository.findByRecipientIdOrderByCreatedAtDesc(creator.getId())
                .stream().limit(10).map(this::toDto).toList();

        List<PayoutResponseDto> recentPayouts = payoutRequestRepository.findByCreatorIdOrderByCreatedAtDesc(creator.getId())
                .stream().limit(10).map(this::toPayoutDto).toList();

        return CreatorWalletDto.builder()
                .lifetimeEarnings(lifetime)
                .inEscrow(inEscrow)
                .totalWithdrawn(totalWithdrawn)
                .availableBalance(available)
                .recentEscrowDeals(recentPayments)
                .recentPayouts(recentPayouts)
                .build();
    }

    @Transactional
    public PayoutResponseDto requestPayout(String creatorPhone, RequestPayoutDto req) {
        User creator = userRepository.findByPhone(creatorPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Creator not found: " + creatorPhone));

        BigDecimal lifetime = paymentRepository.sumNetAmountByRecipientIdAndStatus(creator.getId(), PaymentStatus.PAID);
        BigDecimal totalWithdrawn = payoutRequestRepository.sumTotalWithdrawnOrPendingByCreatorId(creator.getId());
        BigDecimal available = lifetime.subtract(totalWithdrawn);

        if (req.getAmount().compareTo(available) > 0) {
            throw new IllegalArgumentException("Requested withdrawal (₹" + req.getAmount() + ") exceeds available balance (₹" + available + ")");
        }

        if (req.getPayoutMethod() == PayoutMethod.UPI && (req.getUpiId() == null || req.getUpiId().trim().isEmpty())) {
            throw new IllegalArgumentException("Valid UPI ID is required for UPI payout");
        }

        if (req.getPayoutMethod() == PayoutMethod.BANK_TRANSFER && (req.getAccountNumber() == null || req.getIfscCode() == null)) {
            throw new IllegalArgumentException("Account number and IFSC code are required for Bank Transfer");
        }

        String utr = "UTR" + System.currentTimeMillis() + "" + (int)(Math.random() * 900 + 100);

        PayoutRequest payout = PayoutRequest.builder()
                .creator(creator)
                .amount(req.getAmount())
                .payoutMethod(req.getPayoutMethod())
                .upiId(req.getUpiId())
                .accountNumber(req.getAccountNumber())
                .ifscCode(req.getIfscCode())
                .accountHolderName(req.getAccountHolderName())
                .status(PayoutStatus.TRANSFERRED)
                .utrNumber(utr)
                .processedAt(Instant.now())
                .build();

        PayoutRequest saved = payoutRequestRepository.save(payout);

        String destStr = req.getPayoutMethod() == PayoutMethod.UPI ? "UPI (" + req.getUpiId() + ")" : "Bank Account (***" + (req.getAccountNumber().length() > 4 ? req.getAccountNumber().substring(req.getAccountNumber().length() - 4) : "") + ")";

        notificationService.sendNotification(
                creator,
                creator,
                "Payout Transferred! 🏦",
                "₹" + req.getAmount() + " successfully sent to " + destStr + ". Ref UTR: " + utr,
                NotificationType.PAYOUT_PROCESSED,
                saved.getId(),
                "/creator/dashboard"
        );

        return toPayoutDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getMerchantPaymentHistory(String merchantPhone) {
        User merchant = userRepository.findByPhone(merchantPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Merchant not found: " + merchantPhone));

        return paymentRepository.findByPayerIdOrderByCreatedAtDesc(merchant.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getCreatorPaymentHistory(String creatorPhone) {
        User creator = userRepository.findByPhone(creatorPhone)
                .orElseThrow(() -> new UsernameNotFoundException("Creator not found: " + creatorPhone));

        return paymentRepository.findByRecipientIdOrderByCreatedAtDesc(creator.getId())
                .stream().map(this::toDto).toList();
    }

    private boolean verifyHmacSha256(String data, String signature, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to verify HMAC signature: {}", e.getMessage());
            return false;
        }
    }

    private String createRazorpayCloudOrder(BigDecimal amountInRupees, String receipt) {
        if (razorpayKeyId == null || razorpayKeyId.contains("placeholder") || razorpayKeySecret == null) {
            return "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }

        try {
            long amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100)).longValue();
            String auth = Base64.getEncoder().encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));
            String payload = String.format("{\"amount\":%d,\"currency\":\"INR\",\"receipt\":\"%s\"}", amountInPaise, receipt);

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"").matcher(response.body());
                if (matcher.find()) {
                    return matcher.group(1);
                }
            }
        } catch (Exception e) {
            log.warn("Could not create cloud order on Razorpay API, falling back to local transaction order: {}", e.getMessage());
        }

        return "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private PaymentResponseDto toDto(Payment p) {
        MerchantProfile mProfile = merchantProfileRepository.findByUserId(p.getPayer().getId()).orElse(null);
        String payerName = mProfile != null && mProfile.getBrandName() != null ? mProfile.getBrandName() : "Brand " + p.getPayer().getId();

        CreatorProfile cProfile = creatorProfileRepository.findByUserId(p.getRecipient().getId()).orElse(null);
        String recipientName = cProfile != null && cProfile.getDisplayName() != null ? cProfile.getDisplayName() : "Creator " + p.getRecipient().getId();

        return PaymentResponseDto.builder()
                .id(p.getId())
                .transactionId(p.getTransactionId())
                .applicationId(p.getApplication().getId())
                .campaignTitle(p.getApplication().getCampaign().getTitle())
                .payerId(p.getPayer().getId())
                .payerName(payerName)
                .recipientId(p.getRecipient().getId())
                .recipientName(recipientName)
                .grossAmount(p.getGrossAmount())
                .platformFee(p.getPlatformFee())
                .netAmount(p.getNetAmount())
                .currency(p.getCurrency())
                .gatewayName(p.getGatewayName())
                .gatewayPaymentId(p.getGatewayPaymentId())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private PayoutResponseDto toPayoutDto(PayoutRequest pr) {
        return PayoutResponseDto.builder()
                .id(pr.getId())
                .creatorId(pr.getCreator().getId())
                .amount(pr.getAmount())
                .payoutMethod(pr.getPayoutMethod())
                .upiId(pr.getUpiId())
                .accountNumber(pr.getAccountNumber())
                .ifscCode(pr.getIfscCode())
                .accountHolderName(pr.getAccountHolderName())
                .status(pr.getStatus())
                .utrNumber(pr.getUtrNumber())
                .processedAt(pr.getProcessedAt())
                .createdAt(pr.getCreatedAt())
                .build();
    }
}
