package com.creatorhub.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        log.info("CreatorHub Zero-Dummy-Data policy active: database initialized cleanly for live user accounts.");
    }
}
