package com.creatorhub.backend.config;

import com.creatorhub.backend.entity.*;
import com.creatorhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping seed data.");
            return;
        }

        log.info("Seeding initial data for CreatorHub platform...");

        // 1. Create Demo Merchant
        User merchantUser = User.builder()
                .phone("+919111111111")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .email("partnerships@urbanblend.com")
                .role(Role.MERCHANT)
                .isVerified(true)
                .build();
        merchantUser = userRepository.save(merchantUser);

        MerchantProfile merchantProfile = MerchantProfile.builder()
                .user(merchantUser)
                .companyName("Urban Blend Coffee Co.")
                .brandName("Urban Blend")
                .logoUrl("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80")
                .website("https://urbanblendcoffee.example.com")
                .industry("Food & Beverage")
                .description("Artisanal specialty coffee roasters with 6 locations across the city. We celebrate ethically sourced beans and cozy urban cafe culture.")
                .address("104 Indiranagar 100ft Road")
                .city("Bengaluru")
                .country("India")
                .latitude(12.9716)
                .longitude(77.5946)
                .contactEmail("marketing@urbanblend.com")
                .build();
        merchantProfileRepository.save(merchantProfile);

        // 2. Create Second Merchant
        User merchantUser2 = User.builder()
                .phone("+919222222222")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .email("collabs@fitpulse.com")
                .role(Role.MERCHANT)
                .isVerified(true)
                .build();
        merchantUser2 = userRepository.save(merchantUser2);

        MerchantProfile merchantProfile2 = MerchantProfile.builder()
                .user(merchantUser2)
                .companyName("FitPulse Activewear")
                .brandName("FitPulse")
                .logoUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80")
                .website("https://fitpulsewear.example.com")
                .industry("Fitness & Apparel")
                .description("High-performance sustainable gym wear and athleisure designed for everyday athletes.")
                .address("45 Bandra West Linking Road")
                .city("Mumbai")
                .country("India")
                .latitude(19.0596)
                .longitude(72.8295)
                .contactEmail("social@fitpulse.com")
                .build();
        merchantProfileRepository.save(merchantProfile2);

        // 3. Create Demo Creator 1
        User creatorUser1 = User.builder()
                .phone("+919876543210")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .email("ananya@creatorhub.example")
                .role(Role.CREATOR)
                .isVerified(true)
                .build();
        creatorUser1 = userRepository.save(creatorUser1);

        CreatorProfile creatorProfile1 = CreatorProfile.builder()
                .user(creatorUser1)
                .displayName("Ananya Sharma")
                .bio("Specialty coffee enthusiast, cafe explorer, and lifestyle storyteller based in Bengaluru. Sharing aesthetic daily moments and authentic reviews.")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80")
                .city("Bengaluru")
                .country("India")
                .latitude(12.9784)
                .longitude(77.6408)
                .categories("Food & Beverage,Lifestyle,Travel")
                .instagramHandle("ananyacafes")
                .instagramFollowers(45000)
                .youtubeHandle("AnanyaVlogs")
                .youtubeSubscribers(18500)
                .tiktokHandle("ananyasharma")
                .tiktokFollowers(22000)
                .baseRate(15000.0)
                .portfolioLinks("https://instagram.com/ananyacafes,https://youtube.com/@AnanyaVlogs")
                .isAvailable(true)
                .build();
        creatorProfileRepository.save(creatorProfile1);

        // 4. Create Demo Creator 2
        User creatorUser2 = User.builder()
                .phone("+919765432109")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .email("rohit.fitness@example.com")
                .role(Role.CREATOR)
                .isVerified(true)
                .build();
        creatorUser2 = userRepository.save(creatorUser2);

        CreatorProfile creatorProfile2 = CreatorProfile.builder()
                .user(creatorUser2)
                .displayName("Rohit Verma")
                .bio("Certified strength coach & fitness influencer. Helping people build functional strength, nutrition discipline, and peak energy.")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80")
                .city("Mumbai")
                .country("India")
                .latitude(19.0760)
                .longitude(72.8777)
                .categories("Fitness & Health,Wellness,Athletics")
                .instagramHandle("rohitfitlife")
                .instagramFollowers(88000)
                .youtubeHandle("RohitVermaFitness")
                .youtubeSubscribers(120000)
                .tiktokHandle("rohitfitness")
                .tiktokFollowers(50000)
                .baseRate(25000.0)
                .portfolioLinks("https://instagram.com/rohitfitlife,https://youtube.com/@RohitVermaFitness")
                .isAvailable(true)
                .build();
        creatorProfileRepository.save(creatorProfile2);

        // 5. Create Campaigns
        Campaign campaign1 = Campaign.builder()
                .merchant(merchantUser)
                .title("Winter Cold Brew Series Launch & Cafe Tasting")
                .description("We are unveiling 3 new signature winter cold brews at our flagship Indiranagar cafe. We are looking for energetic food & lifestyle creators to visit our store, experience our live brewing process, taste the flights, and produce high-engagement video content.")
                .category("Food & Beverage")
                .compensationType(CompensationType.PAID)
                .budget(18000.0)
                .deliverables("1 dedicated Instagram Reel + 3 high-res story posts with swipe up/location tag.")
                .minFollowers(10000)
                .targetCity("Bengaluru")
                .targetLatitude(12.9716)
                .targetLongitude(77.5946)
                .radiusKm(20.0)
                .deadline(Instant.now().plus(20, ChronoUnit.DAYS))
                .status(CampaignStatus.ACTIVE)
                .build();
        campaign1 = campaignRepository.save(campaign1);

        Campaign campaign2 = Campaign.builder()
                .merchant(merchantUser)
                .title("Monsoon Espresso Blend Home Brewing Review")
                .description("Promote our newly launched whole bean artisanal roast for espresso machines and Aeropress brewers. Product kit sent directly to your door.")
                .category("Food & Beverage")
                .compensationType(CompensationType.HYBRID)
                .budget(12000.0)
                .deliverables("1 YouTube Short or Instagram Reel showcasing your morning brew ritual with Urban Blend beans.")
                .minFollowers(5000)
                .targetCity("All India")
                .deadline(Instant.now().plus(30, ChronoUnit.DAYS))
                .status(CampaignStatus.ACTIVE)
                .build();
        campaignRepository.save(campaign2);

        Campaign campaign3 = Campaign.builder()
                .merchant(merchantUser2)
                .title("FitPulse Seamless Leggings & Performance Hoodie Try-on")
                .description("Launch campaign for our sweat-wicking seamless compression line. Perfect for high-energy gym, Pilates, cross-fit, or running creators.")
                .category("Fitness & Health")
                .compensationType(CompensationType.PAID)
                .budget(30000.0)
                .deliverables("1 Workout Reel testing the compression in the gym + 1 carousel review of fits.")
                .minFollowers(25000)
                .targetCity("Mumbai")
                .targetLatitude(19.0596)
                .targetLongitude(72.8295)
                .radiusKm(30.0)
                .deadline(Instant.now().plus(15, ChronoUnit.DAYS))
                .status(CampaignStatus.ACTIVE)
                .build();
        campaign3 = campaignRepository.save(campaign3);

        // 6. Create An Active Application / Collaboration
        Application application1 = Application.builder()
                .campaign(campaign1)
                .creator(creatorUser1)
                .pitch("I love Urban Blend and visit the Indiranagar store weekly! My followers are huge foodies and coffee lovers in Indiranagar/Koramangala. I would love to film a dynamic aesthetic reel of the tasting.")
                .proposedRate(18000.0)
                .status(ApplicationStatus.ACCEPTED)
                .paymentStatus(PaymentStatus.ESCROWED)
                .merchantFeedback("Loved Ananya's previous cafe reviews. Exactly matches our brand aesthetic!")
                .build();
        applicationRepository.save(application1);

        log.info("Platform seed data successfully inserted!");
    }
}

