package com.civicissues.service;

import com.civicissues.dto.ApiResponse;
import com.civicissues.entity.Issue;
import com.civicissues.entity.User;
import com.civicissues.repository.FeedbackRepository;
import com.civicissues.repository.IssueRepository;
import com.civicissues.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthorityService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────
    // GET ASSIGNED ISSUES
    // ─────────────────────────────────────────

    public ApiResponse getAssignedIssues(Long authorityId) {

        Optional<User> authorityOpt =
                userRepository.findById(authorityId);
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error("Authority not found.");
        }

        List<Issue> issues = issueRepository
                .findByAuthorityOrderByReportedAtDesc(
                        authorityOpt.get()
                );

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildAuthorityIssueMap(issue)
            );
        }

        return ApiResponse.success(
                "Assigned issues fetched.", issueList
        );
    }

    // ─────────────────────────────────────────
    // GET ISSUES BY STATUS
    // ─────────────────────────────────────────

    public ApiResponse getIssuesByStatus(
            Long authorityId, String status) {

        Optional<User> authorityOpt =
                userRepository.findById(authorityId);
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error("Authority not found.");
        }

        List<Issue> issues = issueRepository
                .findByAuthorityAndStatusOrderByReportedAtDesc(
                        authorityOpt.get(), status
                );

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildAuthorityIssueMap(issue)
            );
        }

        return ApiResponse.success(
                "Issues fetched by status.", issueList
        );
    }

    // ─────────────────────────────────────────
    // UPDATE ISSUE STATUS
    // ─────────────────────────────────────────

    public ApiResponse updateIssueStatus(Long issueId,
                                         String newStatus, Long authorityId) {

        // Find issue
        Optional<Issue> issueOpt =
                issueRepository.findById(issueId);
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        Issue issue = issueOpt.get();

        // Check authority owns this issue
        if (issue.getAuthority() == null ||
                !issue.getAuthority().getId()
                        .equals(authorityId)) {
            return ApiResponse.error(
                    "You are not authorized to update "
                            + "this issue."
            );
        }

        // Validate status transition
        String currentStatus = issue.getStatus();
        if (!isValidStatusTransition(
                currentStatus, newStatus)) {
            return ApiResponse.error(
                    "Invalid status transition from "
                            + currentStatus + " to " + newStatus
            );
        }

        // Update status and timestamps
        issue.setStatus(newStatus);

        switch (newStatus) {
            case "WORK_ASSIGNED":
                issue.setWorkAssignedAt(
                        LocalDateTime.now()
                );
                break;
            case "IN_PROGRESS":
                issue.setWorkStartedAt(
                        LocalDateTime.now()
                );
                break;
            case "COMPLETED":
                issue.setCompletedAt(
                        LocalDateTime.now()
                );
                break;
        }

        issueRepository.save(issue);

        // Send email notification to citizen
        if ("COMPLETED".equals(newStatus)) {
            emailService.sendIssueCompletedEmail(
                    issue.getCitizen().getEmail(),
                    issue.getCitizen().getName(),
                    issue.getIssueCode(),
                    issue.getTitle()
            );
        } else {
            emailService.sendStatusUpdateEmail(
                    issue.getCitizen().getEmail(),
                    issue.getCitizen().getName(),
                    issue.getIssueCode(),
                    issue.getTitle(),
                    newStatus
            );
        }

        return ApiResponse.success(
                "Issue status updated to " + newStatus
                        + " successfully."
        );
    }

    // ─────────────────────────────────────────
    // UPLOAD AFTER IMAGE
    // ─────────────────────────────────────────

    public ApiResponse uploadAfterImage(Long issueId,
                                        MultipartFile afterImage, Long authorityId) {

        // Find issue
        Optional<Issue> issueOpt =
                issueRepository.findById(issueId);
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        Issue issue = issueOpt.get();

        // Check authority owns this issue
        if (issue.getAuthority() == null ||
                !issue.getAuthority().getId()
                        .equals(authorityId)) {
            return ApiResponse.error(
                    "You are not authorized to update "
                            + "this issue."
            );
        }

        // Check issue is in progress or completed
        if (!"IN_PROGRESS".equals(issue.getStatus()) &&
                !"COMPLETED".equals(issue.getStatus()) &&
                !"WORK_ASSIGNED".equals(issue.getStatus())) {
            return ApiResponse.error(
                    "After image can only be uploaded when "
                            + "work is in progress or completed."
            );
        }

        // Save after image
        try {
            String afterImagePath = fileStorageService
                    .saveAfterImage(
                            afterImage,
                            issue.getIssueCode()
                    );
            issue.setAfterImage(afterImagePath);
            issueRepository.save(issue);

            Map<String, Object> data = new HashMap<>();
            data.put("afterImage", afterImagePath);

            return ApiResponse.success(
                    "After image uploaded successfully.",
                    data
            );
        } catch (Exception e) {
            return ApiResponse.error(
                    "Failed to upload image: "
                            + e.getMessage()
            );
        }
    }

    // ─────────────────────────────────────────
    // GET AUTHORITY PROFILE
    // ─────────────────────────────────────────

    public ApiResponse getAuthorityProfile(
            Long authorityId) {

        Optional<User> authorityOpt =
                userRepository.findById(authorityId);
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error("Authority not found.");
        }

        User authority = authorityOpt.get();

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", authority.getId());
        profile.put("name", authority.getName());
        profile.put("email", authority.getEmail());
        profile.put("role", authority.getRole());
        profile.put("department",
                authority.getDepartment());
        profile.put("contactNumber",
                authority.getContactNumber());
        profile.put("city", authority.getCity());
        profile.put("wardNumber",
                authority.getWardNumber());

        // Issue statistics
        profile.put("totalAssigned",
                issueRepository.countByAuthority(authority));
        profile.put("totalCompleted",
                issueRepository.countByAuthorityAndStatus(
                        authority, "COMPLETED"
                ));
        profile.put("inProgress",
                issueRepository.countByAuthorityAndStatus(
                        authority, "IN_PROGRESS"
                ));

        // Performance rating
        Double avgRating = feedbackRepository
                .getAverageRatingByAuthority(authorityId);
        profile.put("averageRating",
                avgRating != null
                        ? Math.round(avgRating * 10.0) / 10.0
                        : 0.0
        );

        long totalFeedbacks = feedbackRepository
                .countByAuthority(authority);
        profile.put("totalFeedbacks", totalFeedbacks);

        // Rating distribution
        List<Object[]> ratingDist = feedbackRepository
                .getRatingDistributionByAuthority(authorityId);
        Map<Integer, Long> ratingDistribution =
                new HashMap<>();
        for (Object[] row : ratingDist) {
            ratingDistribution.put(
                    (Integer) row[0],
                    (Long) row[1]
            );
        }
        profile.put("ratingDistribution",
                ratingDistribution);

        return ApiResponse.success(
                "Authority profile fetched.", profile
        );
    }

    // ─────────────────────────────────────────
    // GET AUTHORITY DASHBOARD STATS
    // ─────────────────────────────────────────

    public ApiResponse getDashboardStats(
            Long authorityId) {

        Optional<User> authorityOpt =
                userRepository.findById(authorityId);
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error("Authority not found.");
        }

        User authority = authorityOpt.get();
        Map<String, Object> stats = new HashMap<>();

        // Issue counts
        stats.put("totalAssigned",
                issueRepository.countByAuthority(authority));
        stats.put("totalCompleted",
                issueRepository.countByAuthorityAndStatus(
                        authority, "COMPLETED"
                ));
        stats.put("inProgress",
                issueRepository.countByAuthorityAndStatus(
                        authority, "IN_PROGRESS"
                ));
        stats.put("assigned",
                issueRepository.countByAuthorityAndStatus(
                        authority, "ASSIGNED"
                ));
        stats.put("workAssigned",
                issueRepository.countByAuthorityAndStatus(
                        authority, "WORK_ASSIGNED"
                ));

        // Average rating
        Double avgRating = feedbackRepository
                .getAverageRatingByAuthority(authorityId);
        stats.put("averageRating",
                avgRating != null
                        ? Math.round(avgRating * 10.0) / 10.0
                        : 0.0
        );

        // Recent assigned issues (top 5)
        List<Issue> recentIssues = issueRepository
                .findByAuthorityOrderByReportedAtDesc(
                        authority
                );

        List<Map<String, Object>> recentList =
                new ArrayList<>();
        int count = 0;
        for (Issue issue : recentIssues) {
            if (count >= 5) break;
            recentList.add(
                    buildAuthorityIssueMap(issue)
            );
            count++;
        }
        stats.put("recentIssues", recentList);

        return ApiResponse.success(
                "Dashboard stats fetched.", stats
        );
    }

    // ─────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────

    // Validate status transitions
    private boolean isValidStatusTransition(
            String current, String next) {
        switch (current) {
            case "ASSIGNED":
                return "WORK_ASSIGNED".equals(next);
            case "WORK_ASSIGNED":
                return "IN_PROGRESS".equals(next);
            case "IN_PROGRESS":
                return "COMPLETED".equals(next);
            default:
                return false;
        }
    }

    // Build authority issue map
    private Map<String, Object> buildAuthorityIssueMap(
            Issue issue) {

        Map<String, Object> map = new HashMap<>();
        map.put("id", issue.getId());
        map.put("issueCode", issue.getIssueCode());
        map.put("title", issue.getTitle());
        map.put("description", issue.getDescription());
        map.put("issueType", issue.getIssueType());
        map.put("customIssueType",
                issue.getCustomIssueType());
        map.put("urgencyLevel", issue.getUrgencyLevel());
        map.put("emergency", issue.isEmergency());
        map.put("address", issue.getAddress());
        map.put("city", issue.getCity());
        map.put("pincode", issue.getPincode());
        map.put("landmark", issue.getLandmark());
        map.put("wardNumber", issue.getWardNumber());
        map.put("status", issue.getStatus());
        map.put("voteCount", issue.getVoteCount());
        map.put("reportedImage", issue.getReportedImage());
        map.put("afterImage", issue.getAfterImage());
        map.put("reportedDate", issue.getReportedDate());
        map.put("expectedCompletionDate",
                issue.getExpectedCompletionDate());
        map.put("workerCount", issue.getWorkerCount());

        // Timeline
        Map<String, Object> timeline = new HashMap<>();
        timeline.put("reportedAt", issue.getReportedAt());
        timeline.put("assignedAt", issue.getAssignedAt());
        timeline.put("workAssignedAt",
                issue.getWorkAssignedAt());
        timeline.put("workStartedAt",
                issue.getWorkStartedAt());
        timeline.put("completedAt", issue.getCompletedAt());
        map.put("timeline", timeline);

        // Citizen info
        if (issue.getCitizen() != null) {
            Map<String, Object> citizenInfo =
                    new HashMap<>();
            citizenInfo.put("name",
                    issue.getCitizen().getName());
            citizenInfo.put("email",
                    issue.getCitizen().getEmail());
            citizenInfo.put("wardNumber",
                    issue.getCitizen().getWardNumber());
            citizenInfo.put("city",
                    issue.getCitizen().getCity());
            map.put("citizen", citizenInfo);
        }

        // Feedback info if completed
        if ("COMPLETED".equals(issue.getStatus())) {
            feedbackRepository.findByIssue(issue)
                    .ifPresent(feedback -> {
                        Map<String, Object> feedbackInfo =
                                new HashMap<>();
                        feedbackInfo.put("starRating",
                                feedback.getStarRating());
                        feedbackInfo.put("comment",
                                feedback.getComment());
                        feedbackInfo.put("submittedAt",
                                feedback.getSubmittedAt());
                        map.put("feedback", feedbackInfo);
                    });
        }

        return map;
    }
    // Get single issue details
    public ApiResponse getIssueDetails(Long issueId,
                                       Long authorityId) {

        Optional<Issue> issueOpt =
                issueRepository.findById(issueId);
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        Issue issue = issueOpt.get();

        // Check authority owns this issue
        if (issue.getAuthority() == null ||
                !issue.getAuthority().getId()
                        .equals(authorityId)) {
            return ApiResponse.error(
                    "You are not authorized to view "
                            + "this issue."
            );
        }

        return ApiResponse.success(
                "Issue fetched.",
                buildAuthorityIssueMap(issue)
        );
    }

    // Get authority feedbacks
    public ApiResponse getAuthorityFeedbacks(
            Long authorityId) {

        Optional<User> authorityOpt =
                userRepository.findById(authorityId);
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error("Authority not found.");
        }

        List<com.civicissues.entity.Feedback> feedbacks =
                feedbackRepository
                        .findByAuthorityOrderBySubmittedAtDesc(
                                authorityOpt.get()
                        );

        List<Map<String, Object>> feedbackList =
                new ArrayList<>();
        for (com.civicissues.entity.Feedback feedback
                : feedbacks) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", feedback.getId());
            map.put("starRating", feedback.getStarRating());
            map.put("comment", feedback.getComment());
            map.put("submittedAt", feedback.getSubmittedAt());
            map.put("issueCode",
                    feedback.getIssue().getIssueCode());
            map.put("issueTitle",
                    feedback.getIssue().getTitle());
            map.put("citizenName",
                    feedback.getCitizen().getName());
            feedbackList.add(map);
        }

        return ApiResponse.success(
                "Feedbacks fetched.", feedbackList
        );
    }

    // Get authority performance
    public ApiResponse getAuthorityPerformance(
            Long authorityId) {

        List<Object[]> perfData = feedbackRepository
                .getAuthorityPerformanceSummary(authorityId);

        Map<String, Object> performance = new HashMap<>();

        Optional<User> authorityOpt =
                userRepository.findById(authorityId);
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error("Authority not found.");
        }

        User authority = authorityOpt.get();

        performance.put("authorityId", authorityId);
        performance.put("name", authority.getName());
        performance.put("department",
                authority.getDepartment());

        // Issue counts
        performance.put("totalAssigned",
                issueRepository.countByAuthority(authority));
        performance.put("totalCompleted",
                issueRepository.countByAuthorityAndStatus(
                        authority, "COMPLETED"
                ));

        // Average rating
        Double avgRating = feedbackRepository
                .getAverageRatingByAuthority(authorityId);
        performance.put("averageRating",
                avgRating != null
                        ? Math.round(avgRating * 10.0) / 10.0
                        : 0.0
        );

        // Total feedbacks
        performance.put("totalFeedbacks",
                feedbackRepository.countByAuthority(authority));

        // Rating distribution
        List<Object[]> ratingDist = feedbackRepository
                .getRatingDistributionByAuthority(authorityId);
        Map<Integer, Long> ratingDistribution =
                new HashMap<>();
        for (Object[] row : ratingDist) {
            ratingDistribution.put(
                    (Integer) row[0], (Long) row[1]
            );
        }
        performance.put("ratingDistribution",
                ratingDistribution);

        // Resolution rate
        long total =
                issueRepository.countByAuthority(authority);
        long completed =
                issueRepository.countByAuthorityAndStatus(
                        authority, "COMPLETED"
                );
        double resolutionRate = total > 0
                ? (double) completed / total * 100
                : 0.0;
        performance.put("resolutionRate",
                Math.round(resolutionRate * 10.0) / 10.0);

        return ApiResponse.success(
                "Performance data fetched.", performance
        );
    }


}
