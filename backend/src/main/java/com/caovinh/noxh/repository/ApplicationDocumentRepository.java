package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, UUID> {

    List<ApplicationDocument> findByApplicationIdOrderByUploadedAtAsc(UUID applicationId);

    void deleteByApplicationId(UUID applicationId);
}
