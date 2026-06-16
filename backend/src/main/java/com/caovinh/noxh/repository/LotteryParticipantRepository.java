package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryParticipantRepository extends JpaRepository<LotteryParticipant, UUID> {

    List<LotteryParticipant> findByEventIdOrderByLotteryCodeAsc(UUID eventId);

    Optional<LotteryParticipant> findTopByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}
