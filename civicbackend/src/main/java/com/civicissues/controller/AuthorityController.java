package com.civicissues.controller;

import com.civicissues.dto.ApiResponse;
import com.civicissues.entity.User;
import com.civicissues.service.AuthorityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/authority")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthorityController {

    @Autowired
    private AuthorityService authorityService;

    // ─────────────────────────────────────────
    // HELPER - GET LOGGED IN AUTHORITY
    // ─────────────────────────────────────────

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder
                .getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    // ─────────────────────────────────────────
    // GET AUTHORITY PROFILE
    // ─────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile() {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getAuthorityProfile(
                        user.getId()
                );
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET DASHBOARD STATS
    // ─────────────────────────────────────────

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getDashboardStats(
                        user.getId()
                );
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET ALL ASSIGNED ISSUES
    // ─────────────────────────────────────────

    @GetMapping("/assigned-issues")
    public ResponseEntity<ApiResponse> getAssignedIssues() {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getAssignedIssues(
                        user.getId()
                );
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET ISSUES BY STATUS
    // ─────────────────────────────────────────

    @GetMapping("/issues/status/{status}")
    public ResponseEntity<ApiResponse> getIssuesByStatus(
            @PathVariable String status) {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getIssuesByStatus(
                        user.getId(), status
                );
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET SINGLE ISSUE DETAILS
    // ─────────────────────────────────────────

    @GetMapping("/issue/{issueId}")
    public ResponseEntity<ApiResponse> getIssueDetails(
            @PathVariable Long issueId) {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getIssueDetails(
                        issueId, user.getId()
                );
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // UPDATE ISSUE STATUS
    // ─────────────────────────────────────────

    @PutMapping("/issue/{issueId}/status")
    public ResponseEntity<ApiResponse> updateIssueStatus(
            @PathVariable Long issueId,
            @RequestParam String status) {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.updateIssueStatus(
                        issueId, status, user.getId()
                );
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // UPLOAD AFTER IMAGE
    // ─────────────────────────────────────────

    @PostMapping(
            value = "/issue/{issueId}/after-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> uploadAfterImage(
            @PathVariable Long issueId,
            @RequestPart("afterImage")
            MultipartFile afterImage) {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.uploadAfterImage(
                        issueId, afterImage, user.getId()
                );
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // GET FEEDBACK FOR AUTHORITY
    // ─────────────────────────────────────────

    @GetMapping("/feedbacks")
    public ResponseEntity<ApiResponse> getMyFeedbacks() {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getAuthorityFeedbacks(
                        user.getId()
                );
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET PERFORMANCE ANALYTICS
    // ─────────────────────────────────────────

    @GetMapping("/performance")
    public ResponseEntity<ApiResponse> getPerformance() {
        User user = getLoggedInUser();
        ApiResponse response =
                authorityService.getAuthorityPerformance(
                        user.getId()
                );
        return ResponseEntity.ok(response);
    }
}