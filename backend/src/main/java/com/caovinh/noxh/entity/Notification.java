package com.caovinh.noxh.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String content;

    String type;

    @Column(name = "is_read")
    @Builder.Default
    Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
