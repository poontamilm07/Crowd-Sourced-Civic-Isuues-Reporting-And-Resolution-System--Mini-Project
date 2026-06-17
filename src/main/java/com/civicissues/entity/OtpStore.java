package com.civicissues.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_store")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Email to which OTP was sent
    @Column(nullable = false)
    private String email;

    // The OTP code (6 digits)
    @Column(nullable = false)
    private String otpCode;

    // Purpose of OTP: REGISTRATION, LOGIN
    @Column(nullable = false)
    private String purpose;

    // Whether OTP has been used
    private boolean used = false;

    // When OTP was created
    private LocalDateTime createdAt;

    // When OTP expires (5 minutes after creation)
    private LocalDateTime expiresAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        // OTP expires in 5 minutes
        this.expiresAt = LocalDateTime.now().plusMinutes(5);
    }

    // Check if OTP is expired
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    // Check if OTP is valid (not used and not expired)
    public boolean isValid() {
        return !this.used && !isExpired();
    }
}
