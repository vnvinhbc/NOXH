package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.lottery.LotteryAuditEventType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lottery_audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LotteryAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    LotteryEvent event;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    LotteryAuditEventType eventType;

    @Column(columnDefinition = "TEXT")
    String payload;

    @Column(name = "previous_hash")
    String previousHash;

    @Column(name = "current_hash", nullable = false)
    String currentHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
