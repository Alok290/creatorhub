package com.creatorhub.backend.repository;

import com.creatorhub.backend.entity.PayoutRequest;
import com.creatorhub.backend.entity.PayoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {

    List<PayoutRequest> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    @Query("SELECT COALESCE(SUM(pr.amount), 0) FROM PayoutRequest pr WHERE pr.creator.id = :creatorId AND pr.status IN ('REQUESTED', 'PROCESSING', 'TRANSFERRED')")
    BigDecimal sumTotalWithdrawnOrPendingByCreatorId(@Param("creatorId") Long creatorId);
}
