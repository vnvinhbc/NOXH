package com.caovinh.noxh.repository;

import com.caovinh.noxh.constant.lottery.LotteryEventStatus;
import com.caovinh.noxh.constant.lottery.LotteryResultType;
import com.caovinh.noxh.entity.LotteryParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LotteryParticipantRepository extends JpaRepository<LotteryParticipant, UUID> {

    List<LotteryParticipant> findByEventIdOrderByLotteryCodeAsc(UUID eventId);

    long countByEventId(UUID eventId);

    @Query("""
            select distinct participant
            from LotteryParticipant participant
            left join LotteryResult result on result.participant = participant
            where participant.application.id in :applicationIds
              and (
                participant.event.status in :blockingEventStatuses
                or result.resultType in :blockingResultTypes
              )
            """)
    List<LotteryParticipant> findBlockingParticipations(
            @Param("applicationIds") List<UUID> applicationIds,
            @Param("blockingEventStatuses") List<LotteryEventStatus> blockingEventStatuses,
            @Param("blockingResultTypes") List<LotteryResultType> blockingResultTypes
    );

    Optional<LotteryParticipant> findTopByApplicationIdOrderByCreatedAtDesc(UUID applicationId);

    @Modifying(flushAutomatically = true)
    @Query("delete from LotteryParticipant participant where participant.event.id = :eventId")
    int deleteByEventId(UUID eventId);
}
