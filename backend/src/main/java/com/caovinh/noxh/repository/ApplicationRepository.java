package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    List<Application> findByUserId(UUID userId);

    List<Application> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Application> findByUserIdAndProjectId(UUID userId, UUID projectId);

    List<Application> findByProjectId(UUID projectId);

    boolean existsByUserIdAndProjectId(UUID userId, UUID projectId);
}
