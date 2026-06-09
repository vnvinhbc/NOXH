package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryJobRepository extends JpaRepository<LotteryJob, UUID> {

    boolean existsByLotteryEventId(UUID eventId);

    Optional<LotteryJob> findByLotteryEventId(UUID eventId);
}
