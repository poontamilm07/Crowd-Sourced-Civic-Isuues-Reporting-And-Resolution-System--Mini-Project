package com.civicissues.service;

import com.civicissues.dto.ApiResponse;
import com.civicissues.dto.AssignIssueRequest;
import com.civicissues.entity.Issue;
import com.civicissues.entity.User;
import com.civicissues.repository.FeedbackRepository;
import com.civicissues.repository.IssueRepository;
import com.civicissues.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────

    // Get all pending users
    public ApiResponse getPendingUsers() {
        List<User> pendingCitizens = userRepository
                .findByRoleAndStatus("CITIZEN", "PENDING");
        List<User> pendingAuthorities = userRepository
                .findByRoleAndStatus("AUTHORITY", "PENDING");

        Map<String, Object> data = new HashMap<>();
        data.put("pendingCitizens",
                buildUserList(pendingCitizens));
        data.put("pendingAuthorities",
                buildUserList(pendingAuthorities));

        return ApiResponse.success(
                "Pending users fetched.", data
        );
    }

    // Approve user account
    public ApiResponse approveUser(Long userId) {
        Optional<User> userOpt =
                userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found.");
        }

        User user = userOpt.get();

        if ("APPROVED".equals(user.getStatus())) {
            return ApiResponse.error(
                    "User is already approved."
            );
        }

        user.setStatus("APPROVED");
        userRepository.save(user);

        // Send approval email
        emailService.sendApprovalEmail(
                user.getEmail(),
                user.getName(),
                user.getRole()
        );

        return ApiResponse.success(
                "User " + user.getName()
                        + " approved successfully."
        );
    }

    // Reject user account
    public ApiResponse rejectUser(Long userId) {
        Optional<User> userOpt =
                userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found.");
        }

        User user = userOpt.get();
        user.setStatus("REJECTED");
        userRepository.save(user);

        // Send rejection email
        emailService.sendRejectionEmail(
                user.getEmail(),
                user.getName()
        );

        return ApiResponse.success(
                "User " + user.getName()
                        + " rejected successfully."
        );
    }

    // Get all users by role
    public ApiResponse getUsersByRole(String role) {
        List<User> users =
                userRepository.findByRole(role);
        return ApiResponse.success(
                "Users fetched.",
                buildUserList(users)
        );
    }

    // Search users
    public ApiResponse searchUsers(String role,
                                   String keyword) {
        List<User> users = userRepository
                .searchByRoleAndKeyword(role, keyword);
        return ApiResponse.success(
                "Search results fetched.",
                buildUserList(users)
        );
    }

    // ─────────────────────────────────────────
    // ISSUE MANAGEMENT
    // ─────────────────────────────────────────

    // Get all issues
    public ApiResponse getAllIssues() {
        List<Issue> issues =
                issueRepository.findAll();
        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(buildAdminIssueMap(issue));
        }
        return ApiResponse.success(
                "All issues fetched.", issueList
        );
    }

    // Get issues by status
    public ApiResponse getIssuesByStatus(String status) {
        List<Issue> issues = issueRepository
                .findByStatusOrderByPriorityScoreDesc(status);
        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(buildAdminIssueMap(issue));
        }
        return ApiResponse.success(
                "Issues fetched by status.", issueList
        );
    }

    // Get overdue issues (not assigned in 48 hours)
    public ApiResponse getOverdueIssues() {
        LocalDateTime cutoffTime =
                LocalDateTime.now().minusHours(48);
        List<Issue> issues = issueRepository
                .findOverdueIssues(cutoffTime);
        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(buildAdminIssueMap(issue));
        }
        return ApiResponse.success(
                "Overdue issues fetched.", issueList
        );
    }

    // Assign issue to authority
    public ApiResponse assignIssue(Long issueId,
                                   AssignIssueRequest request) {

        // Find issue
        Optional<Issue> issueOpt =
                issueRepository.findById(issueId);
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        // Find authority
        Optional<User> authorityOpt =
                userRepository.findById(request.getAuthorityId());
        if (authorityOpt.isEmpty()) {
            return ApiResponse.error(
                    "Authority not found."
            );
        }

        User authority = authorityOpt.get();

        // Check authority is approved
        if (!"APPROVED".equals(authority.getStatus())) {
            return ApiResponse.error(
                    "Authority account is not approved."
            );
        }

        // Check authority role
        if (!"AUTHORITY".equals(authority.getRole())) {
            return ApiResponse.error(
                    "Selected user is not an authority."
            );
        }

        Issue issue = issueOpt.get();

        // Assign issue
        issue.setAuthority(authority);
        issue.setStatus("ASSIGNED");
        issue.setAssignedAt(LocalDateTime.now());
        issue.setWorkerCount(request.getWorkerCount());
        issue.setExpectedCompletionDate(
                request.getExpectedCompletionDate()
        );

        issueRepository.save(issue);

        // Send email to citizen
        emailService.sendIssueAssignedEmail(
                issue.getCitizen().getEmail(),
                issue.getCitizen().getName(),
                issue.getIssueCode(),
                issue.getTitle(),
                authority.getName(),
                authority.getDepartment(),
                request.getExpectedCompletionDate() != null
                        ? request.getExpectedCompletionDate()
                        .toString()
                        : "Not specified"
        );

        return ApiResponse.success(
                "Issue " + issue.getIssueCode()
                        + " assigned to "
                        + authority.getName()
                        + " successfully."
        );
    }

    // Filter issues by ward, pincode or department
    public ApiResponse filterIssues(String ward,
                                    String pincode, String department) {

        List<Issue> allIssues =
                issueRepository.findAll();
        List<Issue> filtered = new ArrayList<>();

        for (Issue issue : allIssues) {
            boolean match = true;

            if (ward != null && !ward.isEmpty()) {
                match = match && ward.equals(
                        issue.getWardNumber()
                );
            }

            if (pincode != null && !pincode.isEmpty()) {
                match = match && pincode.equals(
                        issue.getPincode()
                );
            }

            if (department != null
                    && !department.isEmpty()) {
                if (issue.getAuthority() != null) {
                    match = match && department.equals(
                            issue.getAuthority().getDepartment()
                    );
                } else {
                    match = false;
                }
            }

            if (match) {
                filtered.add(issue);
            }
        }

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : filtered) {
            issueList.add(buildAdminIssueMap(issue));
        }

        return ApiResponse.success(
                "Filtered issues fetched.", issueList
        );
    }

    // Get all approved authorities
    public ApiResponse getAllAuthorities() {
        List<User> authorities = userRepository
                .findAllApprovedAuthorities();
        return ApiResponse.success(
                "Authorities fetched.",
                buildUserList(authorities)
        );
    }

    // Get authorities by department
    public ApiResponse getAuthoritiesByDepartment(
            String department) {
        List<User> authorities = userRepository
                .findApprovedAuthoritiesByDepartment(
                        department
                );
        return ApiResponse.success(
                "Authorities fetched.",
                buildUserList(authorities)
        );
    }

    // ─────────────────────────────────────────
    // ANALYTICS
    // ─────────────────────────────────────────

    // Get dashboard statistics
    public ApiResponse getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User counts
        stats.put("totalCitizens",
                userRepository.countByRole("CITIZEN"));
        stats.put("totalAuthorities",
                userRepository.countByRole("AUTHORITY"));
        stats.put("pendingApprovals",
                userRepository.countByRoleAndStatus(
                        "CITIZEN", "PENDING"
                ) + userRepository.countByRoleAndStatus(
                        "AUTHORITY", "PENDING"
                )
        );


        // Add total vote count
        long totalVotes = issueRepository
                .findAll()
                .stream()
                .mapToLong(Issue::getVoteCount)
                .sum();
        stats.put("totalVotes", totalVotes);

// Add total reports
        stats.put("totalReports",
                issueRepository.count());

// Add duplicate count
        long duplicates = issueRepository
                .findAll()
                .stream()
                .filter(Issue::isDuplicate)
                .count();
        stats.put("duplicateIssues", duplicates);

        // Issue counts
        stats.put("totalIssues",
                issueRepository.count());
        stats.put("reportedIssues",
                issueRepository.countByStatus("REPORTED"));
        stats.put("assignedIssues",
                issueRepository.countByStatus("ASSIGNED"));
        stats.put("inProgressIssues",
                issueRepository.countByStatus("IN_PROGRESS"));
        stats.put("completedIssues",
                issueRepository.countByStatus("COMPLETED"));

        // Overdue issues count
        LocalDateTime cutoffTime =
                LocalDateTime.now().minusHours(48);
        stats.put("overdueIssues",
                issueRepository
                        .findOverdueIssues(cutoffTime).size());

        // Issue type distribution for chart
        List<Object[]> typeData =
                issueRepository.countIssuesByType();
        Map<String, Long> issuesByType = new HashMap<>();
        for (Object[] row : typeData) {
            issuesByType.put(
                    (String) row[0],
                    (Long) row[1]
            );
        }
        stats.put("issuesByType", issuesByType);

        // Issue status distribution for chart
        List<Object[]> statusData =
                issueRepository.countIssuesByStatus();
        Map<String, Long> issuesByStatus = new HashMap<>();
        for (Object[] row : statusData) {
            issuesByStatus.put(
                    (String) row[0],
                    (Long) row[1]
            );
        }
        stats.put("issuesByStatus", issuesByStatus);

        // Authority performance
        List<Object[]> perfData =
                issueRepository.getAuthorityPerformance();
        List<Map<String, Object>> authorityPerformance =
                new ArrayList<>();
        for (Object[] row : perfData) {
            Map<String, Object> perf = new HashMap<>();
            perf.put("authorityId", row[0]);
            perf.put("authorityName", row[1]);
            perf.put("completedIssues", row[2]);
            authorityPerformance.add(perf);
        }
        stats.put("authorityPerformance",
                authorityPerformance);

        // Overall average rating
        Double avgRating =
                feedbackRepository.getOverallAverageRating();
        stats.put("overallAverageRating",
                avgRating != null
                        ? Math.round(avgRating * 10.0) / 10.0
                        : 0.0
        );

        return ApiResponse.success(
                "Dashboard stats fetched.", stats
        );
    }

    // ─────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────

    // Build user list map
    private List<Map<String, Object>> buildUserList(
            List<User> users) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (User user : users) {
            list.add(buildUserMap(user));
        }
        return list;
    }

    // Build user map
    private Map<String, Object> buildUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("status", user.getStatus());
        map.put("city", user.getCity());
        map.put("villageOrArea", user.getVillageOrArea());
        map.put("wardNumber", user.getWardNumber());
        map.put("pincode", user.getPincode());
        map.put("address", user.getAddress());
        map.put("department", user.getDepartment());
        map.put("contactNumber", user.getContactNumber());
        map.put("idCardPhoto", user.getIdCardPhoto());
        map.put("createdAt", user.getCreatedAt());
        map.put("rewardPoints", user.getRewardPoints());
        return map;
    }

    // Build admin issue map
    private Map<String, Object> buildAdminIssueMap(
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
        map.put("priorityScore", issue.getPriorityScore());
        map.put("reportedImage", issue.getReportedImage());
        map.put("afterImage", issue.getAfterImage());
        map.put("reportedDate", issue.getReportedDate());
        map.put("expectedCompletionDate",
                issue.getExpectedCompletionDate());
        map.put("workerCount", issue.getWorkerCount());
        map.put("duplicate", issue.isDuplicate());

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
            citizenInfo.put("id",
                    issue.getCitizen().getId());
            citizenInfo.put("name",
                    issue.getCitizen().getName());
            citizenInfo.put("email",
                    issue.getCitizen().getEmail());
            citizenInfo.put("wardNumber",
                    issue.getCitizen().getWardNumber());
            map.put("citizen", citizenInfo);
        }

        // Authority info
        if (issue.getAuthority() != null) {
            Map<String, Object> authorityInfo =
                    new HashMap<>();
            authorityInfo.put("id",
                    issue.getAuthority().getId());
            authorityInfo.put("name",
                    issue.getAuthority().getName());
            authorityInfo.put("email",
                    issue.getAuthority().getEmail());
            authorityInfo.put("department",
                    issue.getAuthority().getDepartment());
            authorityInfo.put("contactNumber",
                    issue.getAuthority().getContactNumber());
            map.put("authority", authorityInfo);
        }

        return map;
    }

    // Get issue analytics
    public ApiResponse getIssueAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Issues by type
        List<Object[]> typeData =
                issueRepository.countIssuesByType();
        Map<String, Long> issuesByType = new HashMap<>();
        for (Object[] row : typeData) {
            issuesByType.put(
                    (String) row[0], (Long) row[1]
            );
        }
        analytics.put("issuesByType", issuesByType);

        // Issues by status
        List<Object[]> statusData =
                issueRepository.countIssuesByStatus();
        Map<String, Long> issuesByStatus = new HashMap<>();
        for (Object[] row : statusData) {
            issuesByStatus.put(
                    (String) row[0], (Long) row[1]
            );
        }
        analytics.put("issuesByStatus", issuesByStatus);

        // Total counts
        analytics.put("totalIssues",
                issueRepository.count());
        analytics.put("completedIssues",
                issueRepository.countByStatus("COMPLETED"));
        analytics.put("pendingIssues",
                issueRepository.countByStatus("REPORTED"));

        // Resolution rate
        long total = issueRepository.count();
        long completed =
                issueRepository.countByStatus("COMPLETED");
        double resolutionRate = total > 0
                ? (double) completed / total * 100
                : 0.0;
        analytics.put("resolutionRate",
                Math.round(resolutionRate * 10.0) / 10.0);

        // Overdue issues
        LocalDateTime cutoffTime =
                LocalDateTime.now().minusHours(48);
        analytics.put("overdueIssues",
                issueRepository
                        .findOverdueIssues(cutoffTime).size());

        return ApiResponse.success(
                "Issue analytics fetched.", analytics
        );
    }

    // Get authority performance analytics
    public ApiResponse getAuthorityPerformanceAnalytics() {
        List<Object[]> perfData =
                feedbackRepository.getTopPerformingAuthorities();

        List<Map<String, Object>> performanceList =
                new ArrayList<>();
        for (Object[] row : perfData) {
            Map<String, Object> perf = new HashMap<>();
            perf.put("authorityId", row[0]);
            perf.put("authorityName", row[1]);
            perf.put("averageRating",
                    row[2] != null
                            ? Math.round(
                            ((Double) row[2]) * 10.0) / 10.0
                            : 0.0);
            perf.put("totalFeedbacks", row[3]);
            performanceList.add(perf);
        }

        return ApiResponse.success(
                "Authority performance fetched.",
                performanceList
        );
    }

}
