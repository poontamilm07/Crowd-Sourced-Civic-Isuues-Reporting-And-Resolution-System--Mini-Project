package com.civicissues.controller;

import com.civicissues.dto.ApiResponse;
import com.civicissues.dto.FeedbackRequest;
import com.civicissues.dto.IssueRequest;
import com.civicissues.entity.User;
import com.civicissues.service.IssueService;
import com.civicissues.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.civicissues.entity.Issue;
import com.civicissues.repository.IssueRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.civicissues.service
        .DuplicateDetectionService;


import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.civicissues.repository.IssueRepository;

@RestController
@RequestMapping("/api/citizen")
@CrossOrigin(origins = "http://localhost:3000")
public class CitizenController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueRepository issueRepository;

    // ─────────────────────────────────────────
    // HELPER - GET LOGGED IN CITIZEN
    // ─────────────────────────────────────────

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder
                .getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    // ─────────────────────────────────────────
    // GET CITIZEN PROFILE
    // ─────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile() {
        User user = getLoggedInUser();

        // Reload user from database to get fresh data
        Optional<com.civicissues.entity.User> freshUser =
                userRepository.findById(user.getId());

        if (freshUser.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            "User not found."
                    ));
        }

        com.civicissues.entity.User u =
                freshUser.get();

        Map<String, Object> profile =
                new HashMap<>();
        profile.put("id", u.getId());
        profile.put("name", u.getName());
        profile.put("email", u.getEmail());
        profile.put("role", u.getRole());
        profile.put("city", u.getCity());
        profile.put("villageOrArea",
                u.getVillageOrArea());
        profile.put("wardNumber",
                u.getWardNumber());
        profile.put("pincode", u.getPincode());
        profile.put("address", u.getAddress());
        profile.put("rewardPoints",
                u.getRewardPoints());
        profile.put("idCardPhoto",
                u.getIdCardPhoto());
        profile.put("taluk", u.getTaluk());
        profile.put("dateOfBirth", u.getDateOfBirth());
        profile.put("createdAt",
                u.getCreatedAt());
        profile.put("status", u.getStatus());

        long totalIssues = issueService
                .getCitizenIssueCount(u.getId());
        profile.put("totalIssuesReported",
                totalIssues);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile fetched.", profile
                )
        );
    }

    // ─────────────────────────────────────────
    // REPORT ISSUE
    // ─────────────────────────────────────────

    @PostMapping(
            value = "/report-issue",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> reportIssue(
            @RequestPart("data")
            @Valid IssueRequest request,
            @RequestPart(value = "image", required = false)
            MultipartFile image) {

        User user = getLoggedInUser();

        ApiResponse response = issueService.reportIssue(
                request, image, user.getId()
        );

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // GET MY ISSUES
    // ─────────────────────────────────────────

    @GetMapping("/my-issues")
    public ResponseEntity<ApiResponse> getMyIssues() {
        User user = getLoggedInUser();

        ApiResponse response =
                issueService.getCitizenIssues(user.getId());

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET ISSUE BY CODE
    // ─────────────────────────────────────────

    @GetMapping("/issue/{issueCode}")
    public ResponseEntity<ApiResponse> getIssueByCode(
            @PathVariable String issueCode) {

        User user = getLoggedInUser();

        ApiResponse response = issueService
                .getIssueByCode(issueCode, user.getId());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // GET PUBLIC ISSUES
    // ─────────────────────────────────────────

    @GetMapping("/public-issues")
    public ResponseEntity<ApiResponse> getPublicIssues(
            @RequestParam(required = false) String city) {

        User user = getLoggedInUser();

        // Use citizen's city if not provided
        String searchCity = (city != null
                && !city.isEmpty())
                ? city
                : user.getCity();

        ApiResponse response = issueService
                .getPublicIssues(searchCity, user.getId());

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // VOTE ON ISSUE
    // ─────────────────────────────────────────

    @PostMapping("/vote/{issueId}")
    public ResponseEntity<ApiResponse> voteOnIssue(
            @PathVariable Long issueId) {

        User user = getLoggedInUser();

        ApiResponse response = issueService
                .voteOnIssue(issueId, user.getId());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // SEARCH ISSUES
    // ─────────────────────────────────────────

    @GetMapping("/search-issues")
    public ResponseEntity<ApiResponse> searchIssues(
            @RequestParam String keyword,
            @RequestParam(required = false) String city) {

        User user = getLoggedInUser();

        ApiResponse response = issueService
                .searchIssues(keyword, city, user.getId());

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // SUBMIT FEEDBACK
    // ─────────────────────────────────────────

    @PostMapping("/submit-feedback")
    public ResponseEntity<ApiResponse> submitFeedback(
            @RequestBody
            @Valid FeedbackRequest request) {

        User user = getLoggedInUser();

        ApiResponse response = issueService
                .submitFeedback(request, user.getId());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ─────────────────────────────────────────
    // GET VOTED ISSUES
    // ─────────────────────────────────────────

    @GetMapping("/voted-issues")
    public ResponseEntity<ApiResponse> getVotedIssues() {
        User user = getLoggedInUser();

        ApiResponse response = issueService
                .getVotedIssues(user.getId());

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────
    // GET DASHBOARD STATS
    // ─────────────────────────────────────────

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        User user = getLoggedInUser();

        ApiResponse response = issueService
                .getCitizenDashboardStats(user.getId());

        return ResponseEntity.ok(response);
    }
    @GetMapping("/search-before-report")
    public ResponseEntity<ApiResponse>
    searchBeforeReport(
            @RequestParam String keyword,
            @RequestParam(required = false)
            String pincode,
            @RequestParam(required = false)
            String wardNumber) {

        String finalPincode =
                (pincode != null &&
                        !pincode.trim().isEmpty())
                        ? pincode.trim() : null;
        String finalWard =
                (wardNumber != null &&
                        !wardNumber.trim().isEmpty())
                        ? wardNumber.trim() : null;

        List<Issue> issues =
                issueRepository.searchBeforeReport(
                        keyword.trim(),
                        finalPincode,
                        finalWard
                );

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            Map<String, Object> map =
                    new HashMap<>();
            map.put("id", issue.getId());
            map.put("issueCode",
                    issue.getIssueCode());
            map.put("title", issue.getTitle());
            map.put("description",
                    issue.getDescription());
            map.put("issueType",
                    issue.getIssueType());
            map.put("status", issue.getStatus());
            map.put("voteCount",
                    issue.getVoteCount());
            map.put("city", issue.getCity());
            map.put("wardNumber",
                    issue.getWardNumber());
            map.put("pincode", issue.getPincode());
            map.put("reportedImage",
                    issue.getReportedImage());
            issueList.add(map);
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        issueList.size() +
                                " similar issues found.",
                        issueList
                )
        );
    }
    @Autowired
    private DuplicateDetectionService
            duplicateDetectionService;

    @PostMapping("/check-duplicate")
    public ResponseEntity<ApiResponse>
    checkDuplicate(
            @RequestBody
            Map<String, String> request) {

        String title =
                request.get("title");
        String description =
                request.get("description");
        String issueType =
                request.get("issueType");
        String city =
                request.get("city");
        String district =
                request.get("district");
        String taluk =
                request.get("taluk");
        String wardNumber =
                request.get("wardNumber");
        String pincode =
                request.get("pincode");
        String address =
                request.get("address");

        DuplicateDetectionService.DuplicateResult
                result =
                duplicateDetectionService
                        .checkDuplicate(
                                title, description,
                                issueType, city, district,
                                taluk, wardNumber,
                                pincode, address
                        );

        Map<String, Object> response =
                new HashMap<>();
        response.put("isDuplicate",
                result.isDuplicate());
        response.put("score",
                Math.round(result.getScore() * 10.0)
                        / 10.0);

        if (result.isDuplicate() &&
                result.getMatchedIssue() != null) {
            Issue m = result.getMatchedIssue();
            Map<String, Object> issueData =
                    new HashMap<>();
            issueData.put("id", m.getId());
            issueData.put("issueCode",
                    m.getIssueCode());
            issueData.put("title", m.getTitle());
            issueData.put("description",
                    m.getDescription());
            issueData.put("issueType",
                    m.getIssueType());
            issueData.put("status",
                    m.getStatus());
            issueData.put("voteCount",
                    m.getVoteCount());
            issueData.put("city", m.getCity());
            issueData.put("taluk",
                    m.getTaluk());
            issueData.put("wardNumber",
                    m.getWardNumber());
            issueData.put("pincode",
                    m.getPincode());
            issueData.put("address",
                    m.getAddress());
            issueData.put("reportedImage",
                    m.getReportedImage());
            issueData.put("reportedAt",
                    m.getReportedAt());
            issueData.put("urgencyLevel",
                    m.getUrgencyLevel());
            response.put("existingIssue",
                    issueData);
            response.put("message",
                    "Similar issue already reported "
                            + "in your area! ("
                            + Math.round(result.getScore())
                            + "% match)");
        } else {
            response.put("existingIssue", null);
            response.put("message",
                    "No duplicate found. "
                            + "You can submit this issue.");
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Duplicate check complete.",
                        response
                )
        );
    }
}