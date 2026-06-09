package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.ApplicationPriorityTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationPriorityTagRepository extends JpaRepository<ApplicationPriorityTag, UUID> {

    List<ApplicationPriorityTag> findByApplicationId(UUID applicationId);
}
