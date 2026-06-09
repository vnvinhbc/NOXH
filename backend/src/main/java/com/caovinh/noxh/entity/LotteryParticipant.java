package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.lottery.LotteryPoolType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lottery_participant")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    LotteryEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    Application application;

    @Column(name = "lottery_code", nullable = false)
    String lotteryCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "pool_type", nullable = false)
    LotteryPoolType poolType;

    @Column(name = "priority_tags", columnDefinition = "TEXT")
    String priorityTags;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
