package com.creatorhub.backend.repository;

import com.creatorhub.backend.entity.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {

    Optional<CreatorProfile> findByUserId(Long userId);

    Optional<CreatorProfile> findByUserPhone(String phone);

    @Query("SELECT c FROM CreatorProfile c WHERE " +
           "c.isAvailable = true AND " +
           "(:category IS NULL OR LOWER(c.categories) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:city IS NULL OR LOWER(c.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:minFollowers IS NULL OR c.totalFollowers >= :minFollowers) AND " +
           "(:search IS NULL OR LOWER(c.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.bio) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<CreatorProfile> searchCreators(
            @Param("category") String category,
            @Param("city") String city,
            @Param("minFollowers") Long minFollowers,
            @Param("search") String search
    );
}

