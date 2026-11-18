package com.creatorhub.backend.repository;

import com.creatorhub.backend.entity.Campaign;
import com.creatorhub.backend.entity.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);

    List<Campaign> findByMerchantPhoneOrderByCreatedAtDesc(String phone);

    @Query("SELECT c FROM Campaign c WHERE " +
           "c.status = :status AND " +
           "(:category IS NULL OR LOWER(c.category) = LOWER(:category)) AND " +
           "(:city IS NULL OR LOWER(c.targetCity) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:minBudget IS NULL OR c.budget >= :minBudget) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.createdAt DESC")
    List<Campaign> searchActiveCampaigns(
            @Param("status") CampaignStatus status,
            @Param("category") String category,
            @Param("city") String city,
            @Param("minBudget") Double minBudget,
            @Param("search") String search
    );
}

