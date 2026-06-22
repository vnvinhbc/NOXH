package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.constant.ApplicationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    List<Application> findByProjectIdAndStatusOrderByCreatedAtAsc(UUID projectId, ApplicationStatus status);

    boolean existsByUserIdAndProjectId(UUID userId, UUID projectId);

    long countByStatus(ApplicationStatus status);

    long countByStatusIn(List<ApplicationStatus> statuses);

    @EntityGraph(attributePaths = {"user", "project", "documents"})
    @Query("select application from Application application where application.id = :id")
    Optional<Application> findAdminApplicationById(UUID id);

    @EntityGraph(attributePaths = {"user", "project"})
    List<Application> findDistinctByStatusInOrderBySubmittedAtDescCreatedAtDesc(
            List<ApplicationStatus> statuses,
            Pageable pageable);

    default List<Application> findAdminApplicationsByStatuses(List<ApplicationStatus> statuses, Pageable pageable) {
        return findDistinctByStatusInOrderBySubmittedAtDescCreatedAtDesc(statuses, pageable);
    }
}
