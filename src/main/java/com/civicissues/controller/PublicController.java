package com.civicissues.controller;

import com.civicissues.dto.ApiResponse;
import com.civicissues.entity.Issue;
import com.civicissues.repository.IssueRepository;
import com.civicissues.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:3000")
public class PublicController {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/issues")
    public ResponseEntity<ApiResponse>
    getPublicIssues(
            @RequestParam(required = false)
            String city,
            @RequestParam(required = false)
            String pincode) {

        List<Issue> issues;

        if (city != null && !city.isEmpty()) {
            issues = issueRepository
                    .findByCityOrderByReportedAtDesc(
                            city
                    );
        } else if (pincode != null
                && !pincode.isEmpty()) {
            issues = issueRepository
                    .findByPincodeOrderByReportedAtDesc(
                            pincode
                    );
        } else {
            issues = issueRepository.findAll();
            issues.sort((a, b) ->
                    b.getVoteCount() - a.getVoteCount()
            );
            if (issues.size() > 20) {
                issues = issues.subList(0, 20);
            }
        }

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildPublicIssueMap(issue)
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Public issues fetched.",
                        issueList
                )
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse>
    getPublicStats() {

        Map<String, Object> stats =
                new HashMap<>();

        stats.put("totalIssues",
                issueRepository.count());
        stats.put("resolvedIssues",
                issueRepository
                        .countByStatus("COMPLETED"));
        stats.put("pendingIssues",
                issueRepository
                        .countByStatus("REPORTED")
                        + issueRepository
                        .countByStatus("ASSIGNED")
                        + issueRepository
                        .countByStatus("IN_PROGRESS"));
        stats.put("totalCitizens",
                userRepository.countByRole("CITIZEN"));
        stats.put("totalAuthorities",
                userRepository
                        .countByRole("AUTHORITY"));

        long total = issueRepository.count();
        long completed = issueRepository
                .countByStatus("COMPLETED");
        double resolutionRate = total > 0
                ? (double) completed / total * 100
                : 0.0;
        stats.put("resolutionRate",
                Math.round(resolutionRate * 10.0)
                        / 10.0);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Public stats fetched.", stats
                )
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse>
    searchPublicIssues(
            @RequestParam String keyword) {

        List<Issue> issues =
                issueRepository.searchIssues(keyword);

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildPublicIssueMap(issue)
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Search results fetched.",
                        issueList
                )
        );
    }

    @GetMapping("/top-issues")
    public ResponseEntity<ApiResponse>
    getTopIssues(
            @RequestParam(required = false)
            String city) {

        List<Issue> issues;

        if (city != null && !city.isEmpty()) {
            issues = issueRepository
                    .findTopVotedIssuesByCity(city);
        } else {
            issues = issueRepository.findAll();
            issues.sort((a, b) ->
                    b.getVoteCount() - a.getVoteCount()
            );
        }

        if (issues.size() > 10) {
            issues = issues.subList(0, 10);
        }

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildPublicIssueMap(issue)
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Top issues fetched.", issueList
                )
        );
    }

    @GetMapping("/track/{issueCode}")
    public ResponseEntity<ApiResponse>
    trackIssue(
            @PathVariable String issueCode) {

        Optional<Issue> issueOpt =
                issueRepository
                        .findByIssueCode(issueCode);

        if (issueOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            "Issue not found with ID: "
                                    + issueCode
                    ));
        }

        Issue issue = issueOpt.get();
        Map<String, Object> data =
                buildDetailedPublicIssueMap(issue);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issue found.", data
                )
        );
    }

    @GetMapping("/issues/search")
    public ResponseEntity<ApiResponse>
    searchIssuesAdvanced(
            @RequestParam(required = false)
            String keyword,
            @RequestParam(required = false)
            String city,
            @RequestParam(required = false)
            String wardNumber,
            @RequestParam(required = false)
            String taluk,
            @RequestParam(required = false)
            String pincode,
            @RequestParam(required = false)
            String issueType) {

        String mappedKeyword = keyword;
        if (keyword != null) {
            String kw = keyword.toLowerCase();
            if (kw.contains("water")
                    || kw.contains("leak")
                    || kw.contains("pipe")) {
                mappedKeyword = "water";
            } else if (kw.contains("garbage")
                    || kw.contains("waste")
                    || kw.contains("trash")) {
                mappedKeyword = "garbage";
            } else if (kw.contains("road")
                    || kw.contains("pothole")) {
                mappedKeyword = "road";
            } else if (kw.contains("drain")
                    || kw.contains("block")) {
                mappedKeyword = "drainage";
            } else if (kw.contains("light")
                    || kw.contains("street")) {
                mappedKeyword = "street light";
            }
        }

        String finalKeyword =
                (mappedKeyword != null
                        && !mappedKeyword.trim().isEmpty())
                        ? mappedKeyword.trim() : null;
        String finalCity =
                (city != null
                        && !city.trim().isEmpty())
                        ? city.trim() : null;
        String finalWard =
                (wardNumber != null
                        && !wardNumber.trim().isEmpty())
                        ? wardNumber.trim() : null;
        String finalPincode =
                (pincode != null
                        && !pincode.trim().isEmpty())
                        ? pincode.trim() : null;
        String finalTaluk =
                (taluk != null && !taluk.trim().isEmpty())
                        ? taluk.trim() : null;
        String finalType =
                (issueType != null
                        && !issueType.trim().isEmpty())
                        ? issueType.trim() : null;

        List<Issue> issues =
                issueRepository.searchIssuesAdvanced(
                        finalKeyword, finalCity,
                        finalWard, finalPincode, finalType, finalTaluk
                );

        List<Map<String, Object>> issueList =
                new ArrayList<>();
        for (Issue issue : issues) {
            issueList.add(
                    buildPublicIssueMap(issue)
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Search results: "
                                + issueList.size() + " found.",
                        issueList
                )
        );
    }

    // ─────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────

    private Map<String, Object>
    buildPublicIssueMap(Issue issue) {
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
        map.put("customIssueType",
                issue.getCustomIssueType());
        map.put("urgencyLevel",
                issue.getUrgencyLevel());
        map.put("emergency",
                issue.isEmergency());
        map.put("city", issue.getCity());
        map.put("wardNumber",
                issue.getWardNumber());
        map.put("pincode", issue.getPincode());
        map.put("address", issue.getAddress());
        map.put("landmark",
                issue.getLandmark());
        map.put("status", issue.getStatus());
        map.put("voteCount",
                issue.getVoteCount());
        map.put("priorityScore",
                issue.getPriorityScore());
        map.put("reportedImage",
                issue.getReportedImage());
        map.put("afterImage",
                issue.getAfterImage());
        map.put("reportedAt",
                issue.getReportedAt());
        return map;
    }

    private Map<String, Object>
    buildDetailedPublicIssueMap(
            Issue issue) {

        Map<String, Object> map =
                buildPublicIssueMap(issue);

        Map<String, Object> timeline =
                new HashMap<>();
        timeline.put("reportedAt",
                issue.getReportedAt());
        timeline.put("assignedAt",
                issue.getAssignedAt());
        timeline.put("workAssignedAt",
                issue.getWorkAssignedAt());
        timeline.put("workStartedAt",
                issue.getWorkStartedAt());
        timeline.put("completedAt",
                issue.getCompletedAt());
        map.put("timeline", timeline);

        map.put("reportedDate",
                issue.getReportedDate());
        map.put("expectedCompletionDate",
                issue.getExpectedCompletionDate());
        map.put("workerCount",
                issue.getWorkerCount());

        if (issue.getAuthority() != null) {
            Map<String, Object> authorityInfo =
                    new HashMap<>();
            authorityInfo.put("name",
                    issue.getAuthority().getName());
            authorityInfo.put("department",
                    issue.getAuthority()
                            .getDepartment());
            map.put("authority", authorityInfo);
        }

        return map;
    }


}