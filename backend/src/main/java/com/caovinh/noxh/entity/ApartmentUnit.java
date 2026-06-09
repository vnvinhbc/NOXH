package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "apartment_unit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApartmentUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Column(name = "apartment_code", nullable = false)
    String apartmentCode;

    String building;

    @Column(name = "block_name")
    String blockName;

    Integer floor;

    @Column(name = "unit_number")
    String unitNumber;

    @Column(name = "area_sqm")
    BigDecimal areaSqm;

    @Column(name = "bedroom_count")
    Integer bedroomCount;

    String direction;

    @Column(name = "price_per_sqm")
    Long pricePerSqm;

    @Column(name = "total_price")
    Long totalPrice;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ApartmentUnitStatus status = ApartmentUnitStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_event_id")
    LotteryEvent lockedEvent;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_result_id")
    LotteryResult assignedResult;

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
