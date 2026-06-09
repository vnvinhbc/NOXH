package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.lottery.LotteryPoolType;
import com.caovinh.noxh.constant.lottery.LotteryResultType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lottery_result")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    LotteryEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    LotteryParticipant participant;

    @Column(name = "lottery_code", nullable = false)
    String lotteryCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "pool_type", nullable = false)
    LotteryPoolType poolType;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_type", nullable = false)
    LotteryResultType resultType;

    @Column(name = "normal_random_value")
    String normalRandomValue;

    @Column(name = "winner_unit_hash")
    String winnerUnitHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    ApartmentUnit apartment;

    @Column(name = "apartment_code")
    String apartmentCode;

    @Column(name = "unit_random_value")
    String unitRandomValue;

    @Column(name = "draw_order")
    Integer drawOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
