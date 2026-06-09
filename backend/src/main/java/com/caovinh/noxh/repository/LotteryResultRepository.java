package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LotteryResultRepository extends JpaRepository<LotteryResult, UUID> {

    boolean existsByEventId(UUID eventId);

    List<LotteryResult> findByEventIdOrderByLotteryCodeAsc(UUID eventId);

    List<LotteryResult> findByEventIdOrderByDrawOrderAsc(UUID eventId);
}
