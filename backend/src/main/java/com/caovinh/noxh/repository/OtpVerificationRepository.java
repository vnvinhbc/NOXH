package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    @Query("SELECT o FROM OtpVerification o WHERE o.email = :email AND o.used = false AND o.expiresAt > :now ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpVerification> findLatestValid(String email, LocalDateTime now);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.email = :email")
    void deleteAllByEmail(String email);
}
