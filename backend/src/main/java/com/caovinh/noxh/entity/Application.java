package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(name = "priority_score")
    @Builder.Default
    Integer priorityScore = 0;

    @Column(name = "lottery_number")
    String lotteryNumber;

    String province;
    String district;
    String ward;

    @Column(name = "detailed_address")
    String detailedAddress;

    @Column(name = "household_size")
    Integer householdSize;

    @Column(name = "priority_category")
    String priorityCategory;

    @Column(name = "income_per_month")
    Long incomePerMonth;

    @Column(name = "tax_code")
    String taxCode;

    @Column(name = "lottery_result")
    String lotteryResult;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<ApplicationDocument> documents;

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
