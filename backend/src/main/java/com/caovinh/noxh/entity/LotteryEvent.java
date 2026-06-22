package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.lottery.LotteryEventStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lottery_event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Column(nullable = false)
    String name;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    LotteryEventStatus status = LotteryEventStatus.CREATED;

    @Column(name = "algorithm_type", nullable = false)
    @Builder.Default
    String algorithmType = "NOXH_COMMIT_REVEAL_V1";

    @Column(name = "private_salt", columnDefinition = "TEXT")
    String privateSalt;

    @Column(name = "commitment_hash")
    String commitmentHash;

    @Column(name = "participant_hash")
    String participantHash;

    @Column(name = "apartment_hash")
    String apartmentHash;

    @Column(name = "xsmb_draw_date")
    LocalDate xsmbDrawDate;

    @Column(name = "xsmb_result", columnDefinition = "TEXT")
    String xsmbResult;

    @Column(name = "eth_chain_id")
    Long ethChainId;

    @Column(name = "eth_block_number")
    Long ethBlockNumber;

    @Column(name = "eth_block_hash")
    String ethBlockHash;

    @Column(name = "seed_source_note", columnDefinition = "TEXT")
    String seedSourceNote;

    @Column(name = "scheduled_start_at")
    LocalDateTime scheduledStartAt;

    @Column(name = "clicked_timestamp")
    LocalDateTime clickedTimestamp;

    @Column(name = "final_seed")
    String finalSeed;

    @Column(name = "sorted_normal_hash")
    String sortedNormalHash;

    @Column(name = "sorted_winner_hash")
    String sortedWinnerHash;

    @Column(name = "sorted_apartment_hash")
    String sortedApartmentHash;

    @Column(name = "assignment_list_hash")
    String assignmentListHash;

    @Column(name = "result_hash")
    String resultHash;

    @Column(name = "failed_reason", columnDefinition = "TEXT")
    String failedReason;

    @Column(name = "locked_at")
    LocalDateTime lockedAt;

    @Column(name = "started_at")
    LocalDateTime startedAt;

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
