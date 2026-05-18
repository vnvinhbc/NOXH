package com.caovinh.noxh.repository;

import com.caovinh.noxh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByCccdNumber(String cccdNumber);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByCccdNumber(String cccdNumber);

    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.phoneNumber = :identifier OR u.cccdNumber = :identifier")
    Optional<User> findByIdentifier(@Param("identifier") String identifier);
}
