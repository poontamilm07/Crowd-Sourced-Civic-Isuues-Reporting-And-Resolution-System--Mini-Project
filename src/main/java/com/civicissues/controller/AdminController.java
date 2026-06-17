package com.civicissues.controller;

import com.civicissues.dto.ApiResponse;
import com.civicissues.dto.AssignIssueRequest;
import com.civicissues.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.civicissues.entity.Issue;
import com.civicissues.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private IssueRepository issueRepository;

    // ─────────────────────────────────────────
    // DASHBOARD STATS
    // ─────────────────────────────────────────

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        ApiResponse response =
                adminService.getDashboardStats();
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────

    // Get all pending users
    @GetMapping("/pending-users")
    public ResponseEntity<ApiResponse> getPendingUsers() {
        ApiResponse response =
                adminService.getPendingUsers();
        return ResponseEntity.ok(response);
    }

    // Get all users by role
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getUsersByRole(
            @RequestParam String role) {
        ApiResponse response =
                adminService.getUsersByRole(role);
        return ResponseEntity.ok(response);
    }

    // Search users
    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse> searchUsers(
            @RequestParam String role,
            @RequestParam String keyword) {
        ApiResponse response =
                adminService.searchUsers(role, keyword);
        return ResponseEntity.ok(response);
    }

    // Approve user
    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<ApiResponse> approveUser(
            @PathVariable Long userId) {
        ApiResponse response =
                adminService.approveUser(userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // Reject user
    @PutMapping("/users/{userId}/reject")
    public ResponseEntity<ApiResponse> rejectUser(
            @PathVariable Long userId) {
        ApiResponse response =
                adminService.rejectUser(userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // ISSUE MANAGEMENT
    // ─────────────────────────────────────────

    // Get all issues
    @GetMapping("/issues")
    public ResponseEntity<ApiResponse> getAllIssues() {
        ApiResponse response =
                adminService.getAllIssues();
        return ResponseEntity.ok(response);
    }

    // Get issues by status
    @GetMapping("/issues/status/{status}")
    public ResponseEntity<ApiResponse> getIssuesByStatus(
            @PathVariable String status) {
        ApiResponse response =
                adminService.getIssuesByStatus(status);
        return ResponseEntity.ok(response);
    }

    // Get overdue issues
    @GetMapping("/issues/overdue")
    public ResponseEntity<ApiResponse> getOverdueIssues() {
        ApiResponse response =
                adminService.getOverdueIssues();
        return ResponseEntity.ok(response);
    }

    // Filter issues
    @GetMapping("/issues/filter")
    public ResponseEntity<ApiResponse> filterIssues(
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false)
            String department) {
        ApiResponse response =
                adminService.filterIssues(
                        ward, pincode, department
                );
        return ResponseEntity.ok(response);
    }

    // Assign issue to authority
    @PutMapping("/issues/{issueId}/assign")
    public ResponseEntity<ApiResponse> assignIssue(
            @PathVariable Long issueId,
            @RequestBody
            @Valid AssignIssueRequest request) {
        ApiResponse response =
                adminService.assignIssue(issueId, request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // AUTHORITY MANAGEMENT
    // ─────────────────────────────────────────

    // Get all approved authorities
    @GetMapping("/authorities")
    public ResponseEntity<ApiResponse> getAllAuthorities() {
        ApiResponse response =
                adminService.getAllAuthorities();
        return ResponseEntity.ok(response);
    }

    // Get authorities by department
    @GetMapping("/authorities/department/{department}")
    public ResponseEntity<ApiResponse>
    getAuthoritiesByDepartment(
            @PathVariable String department) {
        ApiResponse response =
                adminService.getAuthoritiesByDepartment(
                        department
                );
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // ANALYTICS
    // ─────────────────────────────────────────

    // Get issue analytics
    @GetMapping("/analytics/issues")
    public ResponseEntity<ApiResponse> getIssueAnalytics() {
        ApiResponse response =
                adminService.getIssueAnalytics();
        return ResponseEntity.ok(response);
    }

    // Get authority performance analytics
    @GetMapping("/analytics/authority-performance")
    public ResponseEntity<ApiResponse>
    getAuthorityPerformance() {
        ApiResponse response =
                adminService.getAuthorityPerformanceAnalytics();
        return ResponseEntity.ok(response);
    }
    @PostMapping("/issues/merge")
    public ResponseEntity<ApiResponse> mergeIssues(
            @RequestParam Long originalId,
            @RequestParam Long duplicateId) {

        Optional<Issue> originalOpt =
                issueRepository.findById(originalId);
        Optional<Issue> duplicateOpt =
                issueRepository.findById(duplicateId);

        if (originalOpt.isEmpty() ||
                duplicateOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            "Issue not found."
                    ));
        }

        Issue original = originalOpt.get();
        Issue duplicate = duplicateOpt.get();

        // Add votes from duplicate to original
        original.setVoteCount(
                original.getVoteCount() +
                        duplicate.getVoteCount()
        );

        // Add report count
        original.setReportCount(
                original.getReportCount() +
                        duplicate.getReportCount()
        );

        // Mark duplicate
        duplicate.setDuplicate(true);
        duplicate.setParentIssue(original);
        duplicate.setVoteCount(0);

        issueRepository.save(original);
        issueRepository.save(duplicate);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issues merged successfully.",
                        null
                )
        );
    }
}