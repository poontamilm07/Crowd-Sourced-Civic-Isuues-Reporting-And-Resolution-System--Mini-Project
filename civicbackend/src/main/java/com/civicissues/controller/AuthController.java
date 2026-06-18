package com.civicissues.controller;

import com.civicissues.dto.*;
import com.civicissues.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ─────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────

    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> register(
            @RequestPart("data")
            @Valid RegisterRequest request,
            @RequestPart("idCardPhoto")
            MultipartFile idCardPhoto) {

        ApiResponse response =
                authService.register(request, idCardPhoto);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // VERIFY REGISTRATION OTP
    // ─────────────────────────────────────────

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<ApiResponse> verifyRegistrationOtp(
            @RequestBody
            @Valid OtpVerifyRequest request) {

        ApiResponse response =
                authService.verifyRegistrationOtp(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @RequestBody
            @Valid LoginRequest request) {

        ApiResponse response = authService.login(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // VERIFY LOGIN OTP
    // ─────────────────────────────────────────

    @PostMapping("/verify-login-otp")
    public ResponseEntity<ApiResponse> verifyLoginOtp(
            @RequestBody
            @Valid OtpVerifyRequest request) {

        ApiResponse response =
                authService.verifyLoginOtp(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // RESEND OTP
    // ─────────────────────────────────────────

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse> resendOtp(
            @RequestParam String email,
            @RequestParam String purpose) {

        ApiResponse response =
                authService.resendOtp(email, purpose);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // CHECK EMAIL EXISTS
    // ─────────────────────────────────────────

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse> checkEmail(
            @RequestParam String email) {

        boolean exists =
                authService.checkEmailExists(email);

        if (exists) {
            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Email already registered."
                    )
            );
        }
        return ResponseEntity.ok(
                ApiResponse.success("Email is available.")
        );
    }


}
