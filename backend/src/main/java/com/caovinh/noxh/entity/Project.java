package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    String location;
    String province;

    @Column(name = "total_units")
    Integer totalUnits;

    @Column(name = "available_units")
    Integer availableUnits;

    @Column(name = "price_per_sqm")
    Long pricePerSqm;

    @Column(name = "min_area")
    Double minArea;

    @Column(name = "max_area")
    Double maxArea;

    @Column(name = "registration_start")
    LocalDate registrationStart;

    @Column(name = "registration_end")
    LocalDate registrationEnd;

    @Column(name = "lottery_date")
    LocalDateTime lotteryDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ProjectStatus status = ProjectStatus.OPEN;

    @Column(name = "image_url", columnDefinition = "TEXT")
    String imageUrl;

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
