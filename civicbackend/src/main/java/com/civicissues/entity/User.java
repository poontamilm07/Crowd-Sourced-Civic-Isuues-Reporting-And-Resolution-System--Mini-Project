package com.civicissues.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Role: CITIZEN, ADMIN, AUTHORITY
    @Column(nullable = false)
    private String role;

    // Account Status: PENDING, APPROVED, REJECTED
    @Column(nullable = false)
    private String status;

    // ID Card Photo file path
    private String idCardPhoto;

    private String city;

    private String villageOrArea;

    private String wardNumber;

    private String taluk;

    private String dateOfBirth;

    @Column(name = "last_otp_verified")
    private java.time.LocalDateTime lastOtpVerified;

    private String pincode;

    @Column(columnDefinition = "TEXT")
    private String address;

    // For Authority: Department name
    private String department;

    // For Authority: Contact number
    private String contactNumber;

    // OTP for email verification
    private String otp;

    // OTP expiry time
    private LocalDateTime otpExpiry;

    // Is email verified
    private boolean emailVerified = false;

    // Account created time
    private LocalDateTime createdAt;

    // Reward points for citizens
    private int rewardPoints = 0;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}

