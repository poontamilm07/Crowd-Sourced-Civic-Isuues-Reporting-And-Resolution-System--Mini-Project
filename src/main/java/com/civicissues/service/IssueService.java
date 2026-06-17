package com.civicissues.service;

import com.civicissues.dto.ApiResponse;
import com.civicissues.dto.FeedbackRequest;
import com.civicissues.dto.IssueRequest;
import com.civicissues.entity.*;
import com.civicissues.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueVoteRepository issueVoteRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────
    // REPORT ISSUE
    // ─────────────────────────────────────────

    public ApiResponse reportIssue(IssueRequest request,
                                   MultipartFile image, Long citizenId) {

        // Find citizen
        Optional<User> citizenOpt =
                userRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) {
            return ApiResponse.error("Citizen not found.");
        }

        User citizen = citizenOpt.get();

        // Save issue image
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            try {
                imagePath = fileStorageService
                        .saveIssueImage(image, "temp");
            } catch (Exception e) {
                return ApiResponse.error(
                        "Failed to upload image: "
                                + e.getMessage()
                );
            }
        }

        // Create issue
        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setIssueType(request.getIssueType());
        issue.setCustomIssueType(request.getCustomIssueType());
        issue.setUrgencyLevel(request.getUrgencyLevel());
        issue.setEmergency(request.isEmergency());
        issue.setAddress(request.getAddress());
        issue.setCity(request.getCity());
        issue.setPincode(request.getPincode());
        issue.setLandmark(request.getLandmark());
        issue.setWardNumber(request.getWardNumber());
        issue.setReportedDate(request.getReportedDate());
        issue.setTaluk(request.getTaluk());
        issue.setStatus("REPORTED");
        issue.setCitizen(citizen);
        issue.setReportedImage(imagePath);

        // Calculate initial priority score
        int priorityScore = calculatePriorityScore(
                0,
                request.getUrgencyLevel(),
                0
        );
        issue.setPriorityScore(priorityScore);

        // Save issue
        Issue savedIssue = issueRepository.save(issue);

        // Generate issue code
        savedIssue.generateIssueCode();

        // Update image path with issue code
        if (imagePath != null) {
            try {
                String newImagePath = fileStorageService
                        .saveIssueImage(
                                image,
                                savedIssue.getIssueCode()
                        );
                savedIssue.setReportedImage(newImagePath);
            } catch (Exception e) {
                // Keep original path if rename fails
            }
        }

        issueRepository.save(savedIssue);

        // Add reward points to citizen
        citizen.setRewardPoints(
                citizen.getRewardPoints() + 10
        );
        userRepository.save(citizen);

        // Build response
        Map<String, Object> data = new HashMap<>();
        data.put("issueId", savedIssue.getId());
        data.put("issueCode", savedIssue.getIssueCode());
        data.put("status", savedIssue.getStatus());

        return ApiResponse.success(
                "Issue reported successfully! "
                        + "Your Issue ID is: "
                        + savedIssue.getIssueCode(),
                data
        );
    }

    // ─────────────────────────────────────────
    // GET CITIZEN ISSUES
    // ─────────────────────────────────────────

    public ApiResponse getCitizenIssues(Long citizenId) {

        Optional<User> citizenOpt =
                userRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) {
            return ApiResponse.error("Citizen not found.");
        }

        List<Issue> issues = issueRepository
                .findByCitizenOrderByReportedAtDesc(
                        citizenOpt.get()
                );

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(buildIssueMap(issue, citizenId));
        }

        return ApiResponse.success(
                "Issues fetched successfully.", issueList
        );
    }

    // ─────────────────────────────────────────
    // GET ISSUE BY CODE
    // ─────────────────────────────────────────

    public ApiResponse getIssueByCode(String issueCode,
                                      Long userId) {

        Optional<Issue> issueOpt =
                issueRepository.findByIssueCode(issueCode);
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        Issue issue = issueOpt.get();
        Map<String, Object> data =
                buildIssueMap(issue, userId);

        return ApiResponse.success(
                "Issue fetched successfully.", data
        );
    }

    // ─────────────────────────────────────────
    // GET PUBLIC ISSUES
    // ─────────────────────────────────────────

    public ApiResponse getPublicIssues(String city,
                                       Long citizenId) {

        List<Issue> issues;

        if (city != null && !city.isEmpty()) {
            issues = issueRepository
                    .findPublicIssuesByCity(city, citizenId);
        } else {
            issues = issueRepository
                    .findByStatusOrderByPriorityScoreDesc(
                            "REPORTED"
                    );
        }

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(buildPublicIssueMap(
                    issue, citizenId
            ));
        }

        return ApiResponse.success(
                "Public issues fetched.", issueList
        );
    }

    // ─────────────────────────────────────────
    // VOTE ON ISSUE
    // ─────────────────────────────────────────

    public ApiResponse voteOnIssue(Long issueId,
                                   Long citizenId) {

        // Find issue
        Optional<Issue> issueOpt =
                issueRepository.findById(issueId);
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        // Find citizen
        Optional<User> citizenOpt =
                userRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) {
            return ApiResponse.error("Citizen not found.");
        }

        Issue issue = issueOpt.get();
        User citizen = citizenOpt.get();

        // Check if already voted
        if (issueVoteRepository.existsByIssueAndUser(
                issue, citizen)) {
            return ApiResponse.error(
                    "You have already voted on this issue."
            );
        }

        // Save vote
        IssueVote vote = new IssueVote();
        vote.setIssue(issue);
        vote.setUser(citizen);
        issueVoteRepository.save(vote);

        // Update vote count
        issue.setVoteCount(issue.getVoteCount() + 1);

        // Recalculate priority score
        long daysOld = java.time.temporal.ChronoUnit.DAYS
                .between(
                        issue.getReportedAt(),
                        LocalDateTime.now()
                );
        issue.setPriorityScore(calculatePriorityScore(
                issue.getVoteCount(),
                issue.getUrgencyLevel(),
                (int) daysOld
        ));

        issueRepository.save(issue);

        // Add reward points to citizen
        citizen.setRewardPoints(
                citizen.getRewardPoints() + 2
        );
        userRepository.save(citizen);

        Map<String, Object> data = new HashMap<>();
        data.put("voteCount", issue.getVoteCount());
        data.put("priorityScore", issue.getPriorityScore());

        return ApiResponse.success(
                "Vote recorded successfully!", data
        );
    }

    // ─────────────────────────────────────────
    // SEARCH ISSUES
    // ─────────────────────────────────────────

    public ApiResponse searchIssues(String keyword,
                                    String city, Long userId) {

        List<Issue> issues;

        if (city != null && !city.isEmpty()) {
            issues = issueRepository
                    .searchIssuesByCity(city, keyword);
        } else {
            issues = issueRepository
                    .searchIssues(keyword);
        }

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildPublicIssueMap(issue, userId)
            );
        }

        return ApiResponse.success(
                "Search results fetched.", issueList
        );
    }

    // ─────────────────────────────────────────
    // SUBMIT FEEDBACK
    // ─────────────────────────────────────────

    public ApiResponse submitFeedback(
            FeedbackRequest request, Long citizenId) {

        // Find issue
        Optional<Issue> issueOpt =
                issueRepository.findById(request.getIssueId());
        if (issueOpt.isEmpty()) {
            return ApiResponse.error("Issue not found.");
        }

        Issue issue = issueOpt.get();

        // Check issue is completed
        if (!"COMPLETED".equals(issue.getStatus())) {
            return ApiResponse.error(
                    "Feedback can only be submitted for "
                            + "completed issues."
            );
        }

        // Check if feedback already submitted
        if (feedbackRepository.existsByIssue(issue)) {
            return ApiResponse.error(
                    "Feedback already submitted for this issue."
            );
        }

        // Check citizen owns this issue
        if (!issue.getCitizen().getId()
                .equals(citizenId)) {
            return ApiResponse.error(
                    "You can only submit feedback for "
                            + "your own issues."
            );
        }

        // Find citizen
        Optional<User> citizenOpt =
                userRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) {
            return ApiResponse.error("Citizen not found.");
        }

        // Create feedback
        Feedback feedback = new Feedback();
        feedback.setIssue(issue);
        feedback.setCitizen(citizenOpt.get());
        feedback.setAuthority(issue.getAuthority());
        feedback.setStarRating(request.getStarRating());
        feedback.setComment(request.getComment());

        feedbackRepository.save(feedback);

        // Add reward points to citizen
        User citizen = citizenOpt.get();
        citizen.setRewardPoints(
                citizen.getRewardPoints() + 5
        );
        userRepository.save(citizen);

        return ApiResponse.success(
                "Feedback submitted successfully! "
                        + "Thank you for your response."
        );
    }

    // ─────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────

    // Calculate priority score
    private int calculatePriorityScore(int votes,
                                       String urgencyLevel, int daysOld) {

        int severityScore = 0;
        if ("HIGH".equals(urgencyLevel)) {
            severityScore = 30;
        } else if ("MEDIUM".equals(urgencyLevel)) {
            severityScore = 20;
        } else {
            severityScore = 10;
        }

        return votes * 2 + severityScore + daysOld;
    }

    // Build detailed issue map for citizen
    private Map<String, Object> buildIssueMap(
            Issue issue, Long userId) {

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

        // Authority details if assigned
        if (issue.getAuthority() != null) {
            Map<String, Object> authorityInfo =
                    new HashMap<>();
            authorityInfo.put("name",
                    issue.getAuthority().getName());
            authorityInfo.put("department",
                    issue.getAuthority().getDepartment());
            authorityInfo.put("contactNumber",
                    issue.getAuthority().getContactNumber());
            map.put("authority", authorityInfo);
        }

        // Check if user voted
        if (userId != null) {
            boolean hasVoted = issueVoteRepository
                    .existsByIssueAndUser(
                            issue,
                            userRepository.findById(userId)
                                    .orElse(null)
                    );
            map.put("hasVoted", hasVoted);
        }

        // Check feedback
        boolean hasFeedback =
                feedbackRepository.existsByIssue(issue);
        map.put("hasFeedback", hasFeedback);

        return map;
    }

    // Build public issue map
    private Map<String, Object> buildPublicIssueMap(
            Issue issue, Long userId) {

        Map<String, Object> map = new HashMap<>();
        map.put("id", issue.getId());
        map.put("issueCode", issue.getIssueCode());
        map.put("title", issue.getTitle());
        map.put("issueType", issue.getIssueType());
        map.put("urgencyLevel", issue.getUrgencyLevel());
        map.put("emergency", issue.isEmergency());
        map.put("address", issue.getAddress());
        map.put("city", issue.getCity());
        map.put("wardNumber", issue.getWardNumber());
        map.put("status", issue.getStatus());
        map.put("voteCount", issue.getVoteCount());
        map.put("priorityScore", issue.getPriorityScore());
        map.put("reportedImage", issue.getReportedImage());
        map.put("reportedAt", issue.getReportedAt());

        // Check if user voted
        if (userId != null) {
            Optional<User> userOpt =
                    userRepository.findById(userId);
            if (userOpt.isPresent()) {
                boolean hasVoted = issueVoteRepository
                        .existsByIssueAndUser(
                                issue, userOpt.get()
                        );
                map.put("hasVoted", hasVoted);
            }
        }

        return map;
    }

    // Get citizen issue count
    public long getCitizenIssueCount(Long citizenId) {
        Optional<User> citizenOpt =
                userRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) return 0;
        return issueRepository
                .countByCitizen(citizenOpt.get());
    }

    // Get voted issues by citizen
    public ApiResponse getVotedIssues(Long citizenId) {
        List<Long> votedIssueIds = issueVoteRepository
                .findVotedIssueIdsByUser(citizenId);

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Long issueId : votedIssueIds) {
            issueRepository.findById(issueId)
                    .ifPresent(issue ->
                            issueList.add(
                                    buildPublicIssueMap(issue, citizenId)
                            )
                    );
        }
        return ApiResponse.success(
                "Voted issues fetched.", issueList
        );
    }

    // Get citizen dashboard stats
    public ApiResponse getCitizenDashboardStats(
            Long citizenId) {

        Optional<User> citizenOpt =
                userRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) {
            return ApiResponse.error(
                    "Citizen not found."
            );
        }

        User citizen = citizenOpt.get();
        Map<String, Object> stats =
                new HashMap<>();

        List<Issue> issues = issueRepository
                .findByCitizenOrderByReportedAtDesc(
                        citizen
                );

        long total = issues.size();
        long reported = issues.stream()
                .filter(i ->
                        "REPORTED".equals(i.getStatus())
                ).count();
        long assigned = issues.stream()
                .filter(i ->
                        "ASSIGNED".equals(i.getStatus())
                ).count();
        long inProgress = issues.stream()
                .filter(i ->
                        "IN_PROGRESS".equals(i.getStatus())
                ).count();
        long completed = issues.stream()
                .filter(i ->
                        "COMPLETED".equals(i.getStatus())
                ).count();

        stats.put("totalIssues", total);
        stats.put("reportedIssues", reported);
        stats.put("assignedIssues", assigned);
        stats.put("inProgressIssues", inProgress);
        stats.put("completedIssues", completed);
        stats.put("rewardPoints",
                citizen.getRewardPoints());

        return ApiResponse.success(
                "Dashboard stats fetched.", stats
        );
    }




}
