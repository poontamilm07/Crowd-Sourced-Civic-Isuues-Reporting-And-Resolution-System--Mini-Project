package com.civicissues.repository;

import com.civicissues.entity.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpStoreRepository extends JpaRepository<OtpStore, Long> {

    // Find latest OTP by email and purpose
    Optional<OtpStore> findTopByEmailAndPurposeOrderByCreatedAtDesc(
            String email,
            String purpose
    );

    // Find OTP by email, code and purpose
    Optional<OtpStore> findByEmailAndOtpCodeAndPurpose(
            String email,
            String otpCode,
            String purpose
    );

    // Find all OTPs by email
    List<OtpStore> findByEmailOrderByCreatedAtDesc(String email);

    // Find all unused OTPs by email and purpose
    List<OtpStore> findByEmailAndPurposeAndUsedFalse(
            String email,
            String purpose
    );

    // Check if valid OTP exists for email
    boolean existsByEmailAndPurposeAndUsedFalse(
            String email,
            String purpose
    );

    // Mark all OTPs as used for an email and purpose
    @Modifying
    @Transactional
    @Query("UPDATE OtpStore o SET o.used = true " +
            "WHERE o.email = :email AND o.purpose = :purpose")
    void markAllAsUsed(
            @Param("email") String email,
            @Param("purpose") String purpose
    );

    // Delete expired OTPs (cleanup job)
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpStore o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    // Delete all OTPs for an email
    @Modifying
    @Transactional
    void deleteByEmail(String email);

    // Delete all OTPs for email and purpose
    @Modifying
    @Transactional
    void deleteByEmailAndPurpose(String email, String purpose);

    // Count OTPs sent to email in last N minutes (rate limiting)
    @Query("SELECT COUNT(o) FROM OtpStore o " +
            "WHERE o.email = :email " +
            "AND o.purpose = :purpose " +
            "AND o.createdAt > :since")
    long countRecentOtps(
            @Param("email") String email,
            @Param("purpose") String purpose,
            @Param("since") LocalDateTime since
    );
}
