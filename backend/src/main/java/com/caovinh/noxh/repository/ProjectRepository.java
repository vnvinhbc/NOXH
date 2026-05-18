package com.caovinh.noxh.repository;

import com.caovinh.noxh.constant.ProjectStatus;
import com.caovinh.noxh.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findAllByOrderByCreatedAtDesc();
}
