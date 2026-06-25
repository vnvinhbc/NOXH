package com.caovinh.noxh.repository;

import com.caovinh.noxh.constant.lottery.ApartmentUnitStatus;
import com.caovinh.noxh.entity.ApartmentUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApartmentUnitRepository extends JpaRepository<ApartmentUnit, UUID> {

    List<ApartmentUnit> findByProjectIdAndStatusOrderByApartmentCodeAsc(UUID projectId, ApartmentUnitStatus status);

    List<ApartmentUnit> findByProjectIdOrderByApartmentCodeAsc(UUID projectId);

    List<ApartmentUnit> findByLockedEventIdOrderByApartmentCodeAsc(UUID eventId);

    long countByLockedEventId(UUID eventId);

    long countByProjectId(UUID projectId);

    long countByProjectIdAndStatus(UUID projectId, ApartmentUnitStatus status);

    boolean existsByProjectIdAndApartmentCodeIgnoreCase(UUID projectId, String apartmentCode);

    @Modifying(flushAutomatically = true)
    @Query("""
            update ApartmentUnit apartment
            set apartment.status = com.caovinh.noxh.constant.lottery.ApartmentUnitStatus.AVAILABLE,
                apartment.lockedEvent = null
            where apartment.lockedEvent.id = :eventId
            """)
    int releaseLockedApartments(UUID eventId);
}
