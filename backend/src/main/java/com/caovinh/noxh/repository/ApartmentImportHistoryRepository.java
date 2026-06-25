package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.ApartmentImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApartmentImportHistoryRepository extends JpaRepository<ApartmentImportHistory, UUID> {

    List<ApartmentImportHistory> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
}
