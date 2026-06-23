package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.LotteryResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryResultRepository extends JpaRepository<LotteryResult, UUID> {

    boolean existsByEventId(UUID eventId);

    long countByEventId(UUID eventId);

    @EntityGraph(attributePaths = {"event", "participant", "participant.application", "participant.application.user", "apartment"})
    List<LotteryResult> findByEventIdOrderByLotteryCodeAsc(UUID eventId);

    @EntityGraph(attributePaths = {"event", "participant", "participant.application", "participant.application.user", "apartment"})
    List<LotteryResult> findByEventIdOrderByDrawOrderAsc(UUID eventId);

    @EntityGraph(attributePaths = {"event", "participant", "participant.application", "participant.application.user", "apartment"})
    Optional<LotteryResult> findByParticipantId(UUID participantId);
}
