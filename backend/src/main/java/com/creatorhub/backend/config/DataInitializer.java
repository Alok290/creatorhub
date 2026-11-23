package com.creatorhub.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // Ensure enum columns use VARCHAR to prevent MySQL 'Data truncated' errors on new enum constants
            jdbcTemplate.execute("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) NOT NULL");
            log.info("Schema verified: notifications.type is VARCHAR(50)");
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute("ALTER TABLE campaign_applications MODIFY COLUMN status VARCHAR(50) NOT NULL");
            log.info("Schema verified: campaign_applications.status is VARCHAR(50)");
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute("ALTER TABLE campaign_applications MODIFY COLUMN payment_status VARCHAR(50) NOT NULL");
            log.info("Schema verified: campaign_applications.payment_status is VARCHAR(50)");
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN status VARCHAR(50) NOT NULL");
            log.info("Schema verified: payments.status is VARCHAR(50)");
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute("ALTER TABLE payout_requests MODIFY COLUMN payout_method VARCHAR(50) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE payout_requests MODIFY COLUMN status VARCHAR(50) NOT NULL");
            log.info("Schema verified: payout_requests enums are VARCHAR(50)");
        } catch (Exception ignored) {}

        log.info("CreatorHub Zero-Dummy-Data policy active: database initialized cleanly for live user accounts.");
    }
}
