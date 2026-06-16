package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryAuditLogRepository extends JpaRepository<LotteryAuditLog, UUID> {

    Optional<LotteryAuditLog> findTopByEventIdOrderByCreatedAtDesc(UUID eventId);

    List<LotteryAuditLog> findAllByOrderByCreatedAtDesc();

    List<LotteryAuditLog> findByEventIdOrderByCreatedAtAsc(UUID eventId);
}
