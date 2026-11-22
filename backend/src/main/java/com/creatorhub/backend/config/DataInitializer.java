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
            log.info("Schema updated: notifications.type set to VARCHAR(50)");
        } catch (Exception e) {
            log.warn("Could not alter notifications.type: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE campaign_applications MODIFY COLUMN status VARCHAR(50) NOT NULL");
            log.info("Schema updated: campaign_applications.status set to VARCHAR(50)");
        } catch (Exception e) {
            log.warn("Could not alter campaign_applications.status: {}", e.getMessage());
        }

        log.info("CreatorHub Zero-Dummy-Data policy active: database initialized cleanly for live user accounts.");
    }
}
