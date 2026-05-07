package com.civicissues.service;

import com.civicissues.config.JwtUtil;
import com.civicissues.dto.*;
import com.civicissues.entity.OtpStore;
import com.civicissues.entity.User;
import com.civicissues.repository.OtpStoreRepository;
import com.civicissues.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpStoreRepository otpStoreRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private JwtUtil jwtUtil;

    // ─────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────

    public ApiResponse register(RegisterRequest request,
                                MultipartFile idCardPhoto) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error(
                    "Email already registered. Please login."
            );
        }

        // Check admin - only one admin allowed
        if ("ADMIN".equals(request.getRole()) &&
                userRepository.existsByRole("ADMIN")) {
            return ApiResponse.error(
                    "Admin account already exists."
            );
        }

        // Validate authority fields
        if ("AUTHORITY".equals(request.getRole())) {
            if (request.getDepartment() == null ||
                    request.getDepartment().isEmpty()) {
                return ApiResponse.error(
                        "Department is required for Authority."
                );
            }
        }

        // Save ID card photo
        String idCardPath = null;
        if (idCardPhoto != null && !idCardPhoto.isEmpty()) {
            try {
                idCardPath = fileStorageService
                        .saveIdCardPhoto(
                                idCardPhoto,
                                request.getEmail()
                        );
            } catch (Exception e) {
                return ApiResponse.error(
                        "Failed to upload ID card: "
                                + e.getMessage()
                );
            }
        } else {
            return ApiResponse.error(
                    "ID card photo is required."
            );
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(request.getRole());
        user.setStatus("PENDING");
        user.setIdCardPhoto(idCardPath);
        user.setCity(request.getCity());
        user.setVillageOrArea(request.getVillageOrArea());
        user.setWardNumber(request.getWardNumber());
        user.setPincode(request.getPincode());
        user.setAddress(request.getAddress());
        user.setDepartment(request.getDepartment());
        user.setContactNumber(request.getContactNumber());
        user.setTaluk(request.getTaluk());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setEmailVerified(false);

        // Save user to database
        userRepository.save(user);

        // Generate and send OTP
        String otp = generateOtp();
        saveOtp(request.getEmail(), otp, "REGISTRATION");
        emailService.sendOtpEmail(
                request.getEmail(),
                request.getName(),
                otp,
                "REGISTRATION"
        );
        return ApiResponse.success(
                "Registration successful! Please verify your "
                        + "email with the OTP sent to "
                        + request.getEmail()
        );
    }

    // ─────────────────────────────────────────
    // VERIFY REGISTRATION OTP
    // ─────────────────────────────────────────

    public ApiResponse verifyRegistrationOtp(
            OtpVerifyRequest request) {

        // Find user
        Optional<User> userOpt = userRepository
                .findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found.");
        }

        User user = userOpt.get();

        // Check if already verified
        if (user.isEmailVerified()) {
            return ApiResponse.error(
                    "Email already verified."
            );
        }

        // Verify OTP
        ApiResponse otpResult = verifyOtp(
                request.getEmail(),
                request.getOtpCode(),
                "REGISTRATION"
        );

        if (!otpResult.isSuccess()) {
            return otpResult;
        }

        // Mark email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        return ApiResponse.success(
                "Email verified successfully! Your account is "
                        + "pending admin approval. You will receive an "
                        + "email once approved."
        );
    }

    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────

    public ApiResponse login(
            LoginRequest request) {

        // Step 1 - Find user by email
        Optional<User> userOpt =
                userRepository.findByEmail(
                        request.getEmail()
                );

        if (userOpt.isEmpty()) {
            return ApiResponse.error(
                    "Invalid email or password."
            );
        }

        User user = userOpt.get();

        // Step 2 - Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            return ApiResponse.error(
                    "Invalid email or password."
            );
        }

        // Step 3 - Check account status
        if (!user.isEmailVerified()) {
            return ApiResponse.error(
                    "Please verify your email first."
            );
        }

        if (user.getStatus().equals("PENDING")) {
            return ApiResponse.error(
                    "Your account is pending approval."
            );
        }

        if (user.getStatus().equals("REJECTED")) {
            return ApiResponse.error(
                    "Your account has been rejected."
            );
        }

        // Step 4 - Check last OTP verified
        boolean otpRequired =
                isOtpRequired(user);

        if (!otpRequired) {
            // Direct login - skip OTP
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().toString(),
                    user.getId()
            );

            Map<String, Object> data =
                    new HashMap<>();
            data.put("token", token);
            data.put("role",
                    user.getRole().toString());
            data.put("name", user.getName());
            data.put("email", user.getEmail());
            data.put("userId", user.getId());
            data.put("city", user.getCity());
            data.put("otpRequired", false);

            return ApiResponse.success(
                    "Login successful! "
                            + "(OTP skipped - verified recently)",
                    data
            );
        }

        // Step 5 - OTP required
        // Mark all previous OTPs as used
        otpStoreRepository.markAllAsUsed(
                request.getEmail(), "LOGIN"
        );

        // Generate OTP
        String otp = generateOtp();
        saveOtp(request.getEmail(), otp, "LOGIN");
        System.out.println("LOGIN OTP for "
                + request.getEmail()
                + " : " + otp);
        emailService.sendOtpEmail(
                request.getEmail(),
                user.getName(),
                otp,
                "LOGIN"
        );

        // Send email (comment out if email not configured)
        // emailService.sendOtpEmail(
        //     request.getEmail(),
        //     user.getName(),
        //     otp,
        //     "LOGIN"
        // );

        Map<String, Object> data =
                new HashMap<>();
        data.put("otpRequired", true);
        data.put("email", request.getEmail());

        return ApiResponse.success(
                "OTP sent to " +
                        request.getEmail() +
                        ". Valid for 5 minutes.",
                data
        );
    }

    private boolean isOtpRequired(User user) {
        if (user.getLastOtpVerified() == null) {
            return true;
        }

        java.time.LocalDateTime now =
                java.time.LocalDateTime.now();
        java.time.LocalDateTime last =
                user.getLastOtpVerified();

        // Check if more than 24 hours
        long hoursDiff =
                java.time.Duration
                        .between(last, now)
                        .toHours();

        return hoursDiff >= 24;
    }

    // ─────────────────────────────────────────
    // VERIFY LOGIN OTP
    // ─────────────────────────────────────────
    public ApiResponse verifyLoginOtp(
            OtpVerifyRequest request) {

        Optional<User> userOpt =
                userRepository.findByEmail(
                        request.getEmail()
                );

        if (userOpt.isEmpty()) {
            return ApiResponse.error(
                    "User not found."
            );
        }

        User user = userOpt.get();

        // Find latest OTP
        Optional<com.civicissues.entity.OtpStore>
                otpOpt = otpStoreRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                        request.getEmail(), "LOGIN"
                );

        if (otpOpt.isEmpty()) {
            return ApiResponse.error(
                    "OTP not found. Please login again."
            );
        }

        com.civicissues.entity.OtpStore otpStore =
                otpOpt.get();

        // Check if used
        if (otpStore.isUsed()) {
            return ApiResponse.error(
                    "OTP already used. Please login again."
            );
        }

        // Check if expired
        if (otpStore.isExpired()) {
            return ApiResponse.error(
                    "OTP has expired. Please login again."
            );
        }

        // Check OTP match
        if (!otpStore.getOtpCode().equals(
                request.getOtpCode())) {
            return ApiResponse.error(
                    "Invalid OTP. Please try again."
            );
        }

        // Mark OTP as used
        otpStore.setUsed(true);
        otpStoreRepository.save(otpStore);

        // ✅ UPDATE last_otp_verified
        user.setLastOtpVerified(
                java.time.LocalDateTime.now()
        );
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().toString(),
                user.getId()
        );

        Map<String, Object> data =
                new HashMap<>();
        data.put("token", token);
        data.put("role", user.getRole().toString());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("userId", user.getId());
        data.put("city", user.getCity());
        data.put("otpRequired", true);

        return ApiResponse.success(
                "Login successful!", data
        );
    }

    // ─────────────────────────────────────────
    // RESEND OTP
    // ─────────────────────────────────────────

    public ApiResponse resendOtp(String email,
                                 String purpose) {

        // Find user
        Optional<User> userOpt = userRepository
                .findByEmail(email);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found.");
        }

        User user = userOpt.get();

        // Rate limiting check
        long recentOtps = otpStoreRepository.countRecentOtps(
                email,
                purpose,
                LocalDateTime.now().minusMinutes(10)
        );

        if (recentOtps >= 3) {
            return ApiResponse.error(
                    "Too many OTP requests. "
                            + "Please wait 10 minutes."
            );
        }

        // Delete old OTPs
        otpStoreRepository.deleteByEmailAndPurpose(
                email, purpose
        );

        // Generate and send new OTP
        String otp = generateOtp();
        saveOtp(email, otp, purpose);
        emailService.sendOtpEmail(
                email,
                user.getName(),
                otp,
                purpose
        );

        return ApiResponse.success(
                "New OTP sent to " + email
        );
    }

    // ─────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────

    // Generate 6-digit OTP
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // Save OTP to database
    private void saveOtp(String email, String otpCode,
                         String purpose) {
        // Delete old OTPs first
        otpStoreRepository.deleteByEmailAndPurpose(
                email, purpose
        );

        // Save new OTP
        OtpStore otpStore = new OtpStore();
        otpStore.setEmail(email);
        otpStore.setOtpCode(otpCode);
        otpStore.setPurpose(purpose);
        otpStore.setUsed(false);
        otpStoreRepository.save(otpStore);
    }

    // Verify OTP
    private ApiResponse verifyOtp(String email,
                                  String otpCode, String purpose) {

        Optional<OtpStore> otpOpt = otpStoreRepository
                .findByEmailAndOtpCodeAndPurpose(
                        email, otpCode, purpose
                );

        if (otpOpt.isEmpty()) {
            return ApiResponse.error(
                    "Invalid OTP. Please try again."
            );
        }

        OtpStore otpStore = otpOpt.get();

        // Check if already used
        if (otpStore.isUsed()) {
            return ApiResponse.error(
                    "OTP already used. Please request a new one."
            );
        }

        // Check if expired
        if (otpStore.isExpired()) {
            return ApiResponse.error(
                    "OTP has expired. Please request a new one."
            );
        }

        // Mark OTP as used
        otpStore.setUsed(true);
        otpStoreRepository.save(otpStore);

        return ApiResponse.success("OTP verified successfully.");

    }
    // Check if email exists
    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

}


