package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryJobRepository extends JpaRepository<LotteryJob, UUID> {

    boolean existsByLotteryEventId(UUID eventId);

    Optional<LotteryJob> findByLotteryEventId(UUID eventId);

    @Modifying(flushAutomatically = true)
    @Query("delete from LotteryJob job where job.lotteryEvent.id = :eventId")
    int deleteByLotteryEventId(UUID eventId);
}
