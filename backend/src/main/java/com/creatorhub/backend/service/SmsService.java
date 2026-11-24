package com.creatorhub.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
@Slf4j
public class SmsService {

    @Value("${sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${sms.twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Value("${sms.fast2sms.api-key:}")
    private String fast2smsApiKey;

    @Value("${sms.twofactor.api-key:}")
    private String twoFactorApiKey;

    @Value("${sms.msg91.auth-key:}")
    private String msg91AuthKey;

    @Value("${sms.msg91.template-id:}")
    private String msg91TemplateId;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private boolean isNotBlank(String str) {
        return str != null && !str.trim().isEmpty();
    }

    /**
     * Dispatches real SMS to a mobile phone number using configured SMS gateways.
     */
    public boolean sendOtpSms(String phone, String otp) {
        String messageBody = "Your CreatorHub verification code is " + otp + ". Valid for 5 minutes. Do not share this code with anyone.";
        log.info("[SMS Service] Sending real SMS OTP to recipient: {}", phone);

        // 1. Check Twilio Gateway (International & Domestic)
        if (isNotBlank(twilioAccountSid) && isNotBlank(twilioAuthToken) && isNotBlank(twilioPhoneNumber)) {
            return sendTwilioSms(phone, messageBody);
        }

        // 2. Check Fast2SMS Gateway (India)
        if (isNotBlank(fast2smsApiKey)) {
            return sendFast2Sms(phone, otp);
        }

        // 3. Check 2Factor Gateway (India)
        if (isNotBlank(twoFactorApiKey)) {
            return sendTwoFactorSms(phone, otp);
        }

        // 4. Check MSG91 Gateway
        if (isNotBlank(msg91AuthKey)) {
            return sendMsg91Sms(phone, otp);
        }

        log.warn("[SMS Service] No external SMS provider credentials found (TWILIO_ACCOUNT_SID, FAST2SMS_API_KEY, TWOFACTOR_API_KEY, MSG91_AUTH_KEY). Configure one of these in Render / production environment to deliver live carrier SMS.");
        return false;
    }

    private boolean sendTwilioSms(String toPhone, String messageBody) {
        try {
            String form = "To=" + URLEncoder.encode(toPhone, StandardCharsets.UTF_8)
                    + "&From=" + URLEncoder.encode(twilioPhoneNumber, StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(messageBody, StandardCharsets.UTF_8);

            String auth = Base64.getEncoder().encodeToString(
                    (twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8)
            );
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("[Twilio SMS] Real SMS delivered to {}", toPhone);
                return true;
            } else {
                log.error("[Twilio SMS] Delivery failed. Status: {}, Body: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("[Twilio SMS] Exception sending SMS to {}: {}", toPhone, e.getMessage());
            return false;
        }
    }

    private boolean sendFast2Sms(String toPhone, String otp) {
        try {
            String cleanedNumber = toPhone.replaceAll("[^0-9]", "");
            if (cleanedNumber.length() > 10) {
                cleanedNumber = cleanedNumber.substring(cleanedNumber.length() - 10);
            }
            String url = "https://www.fast2sms.com/dev/bulkV2?authorization=" + URLEncoder.encode(fast2smsApiKey, StandardCharsets.UTF_8)
                    + "&route=otp&variables_values=" + URLEncoder.encode(otp, StandardCharsets.UTF_8)
                    + "&numbers=" + URLEncoder.encode(cleanedNumber, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("[Fast2SMS] Real OTP SMS delivered to {}", cleanedNumber);
                return true;
            } else {
                log.error("[Fast2SMS] Delivery failed. Status: {}, Body: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("[Fast2SMS] Exception sending OTP to {}: {}", toPhone, e.getMessage());
            return false;
        }
    }

    private boolean sendTwoFactorSms(String toPhone, String otp) {
        try {
            String cleanedNumber = toPhone.replaceAll("[^0-9]", "");
            if (cleanedNumber.length() > 10) {
                cleanedNumber = cleanedNumber.substring(cleanedNumber.length() - 10);
            }
            String url = "https://2factor.in/API/V1/" + twoFactorApiKey + "/SMS/" + cleanedNumber + "/" + otp + "/CreatorHub";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("[2Factor SMS] Real OTP SMS delivered to {}", cleanedNumber);
                return true;
            } else {
                log.error("[2Factor SMS] Delivery failed. Status: {}, Body: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("[2Factor SMS] Exception sending OTP to {}: {}", toPhone, e.getMessage());
            return false;
        }
    }

    private boolean sendMsg91Sms(String toPhone, String otp) {
        try {
            String cleanedNumber = toPhone.replaceAll("[^0-9]", "");
            String url = "https://control.msg91.com/api/v5/otp?template_id=" + URLEncoder.encode(msg91TemplateId, StandardCharsets.UTF_8)
                    + "&mobile=" + URLEncoder.encode(cleanedNumber, StandardCharsets.UTF_8)
                    + "&authkey=" + URLEncoder.encode(msg91AuthKey, StandardCharsets.UTF_8)
                    + "&otp=" + URLEncoder.encode(otp, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("[MSG91 SMS] Real OTP SMS delivered to {}", cleanedNumber);
                return true;
            } else {
                log.error("[MSG91 SMS] Delivery failed. Status: {}, Body: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("[MSG91 SMS] Exception sending OTP to {}: {}", toPhone, e.getMessage());
            return false;
        }
    }
}
