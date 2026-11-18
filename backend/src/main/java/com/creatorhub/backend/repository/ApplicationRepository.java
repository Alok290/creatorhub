package com.creatorhub.backend.repository;

import com.creatorhub.backend.entity.Application;
import com.creatorhub.backend.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCampaignIdOrderByCreatedAtDesc(Long campaignId);

    List<Application> findByCreatorPhoneOrderByCreatedAtDesc(String phone);

    List<Application> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    List<Application> findByCampaignMerchantPhoneOrderByCreatedAtDesc(String merchantPhone);

    Optional<Application> findByCampaignIdAndCreatorId(Long campaignId, Long creatorId);

    boolean existsByCampaignIdAndCreatorId(Long campaignId, Long creatorId);

    int countByCampaignId(Long campaignId);

    int countByCreatorPhoneAndStatus(String phone, ApplicationStatus status);

    int countByCampaignMerchantPhoneAndStatus(String merchantPhone, ApplicationStatus status);
}

