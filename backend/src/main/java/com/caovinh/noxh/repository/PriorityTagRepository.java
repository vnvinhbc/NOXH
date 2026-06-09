package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.PriorityTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PriorityTagRepository extends JpaRepository<PriorityTag, UUID> {
}
