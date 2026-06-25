package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryEvent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryEventRepository extends JpaRepository<LotteryEvent, UUID> {

    List<LotteryEvent> findAllByOrderByCreatedAtDesc();

    boolean existsByProjectId(UUID projectId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select event from LotteryEvent event where event.id = :eventId")
    Optional<LotteryEvent> findByIdForUpdate(UUID eventId);
}
