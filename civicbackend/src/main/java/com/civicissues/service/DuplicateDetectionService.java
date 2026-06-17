package com.civicissues.service;

import com.civicissues.entity.Issue;
import com.civicissues.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DuplicateDetectionService {

    @Autowired
    private IssueRepository issueRepository;

    private static final Map<String,
            List<String>> KEYWORD_GROUPS =
            new HashMap<>();

    static {
        KEYWORD_GROUPS.put("water",
                Arrays.asList("water", "leak",
                        "pipe", "flood", "overflow",
                        "drainage", "sewage", "tap",
                        "burst", "supply", "drip"));
        KEYWORD_GROUPS.put("road",
                Arrays.asList("road", "pothole",
                        "crack", "damage", "broken",
                        "street", "tar", "asphalt",
                        "patch", "repair", "uneven"));
        KEYWORD_GROUPS.put("garbage",
                Arrays.asList("garbage", "waste",
                        "trash", "dump", "litter",
                        "rubbish", "smell", "odour",
                        "dirty", "filth", "sweeping"));
        KEYWORD_GROUPS.put("light",
                Arrays.asList("light", "lamp",
                        "electric", "dark", "bulb",
                        "power", "street light",
                        "no light", "dim", "fused"));
        KEYWORD_GROUPS.put("drain",
                Arrays.asList("drain", "drainage",
                        "block", "clog", "manhole",
                        "sewage", "stagnant", "flood",
                        "waterlog", "open", "smell"));
        KEYWORD_GROUPS.put("tree",
                Arrays.asList("tree", "fallen",
                        "branch", "root", "obstruct",
                        "danger", "block", "wood",
                        "leaves", "fall"));
        KEYWORD_GROUPS.put("building",
                Arrays.asList("building", "wall",
                        "roof", "collapse", "crack",
                        "dangerous", "structure",
                        "broken", "leaking", "unsafe"));
    }

    public DuplicateResult checkDuplicate(
            String title,
            String description,
            String issueType,
            String city,
            String district,
            String taluk,
            String wardNumber,
            String pincode,
            String address) {

        // Get ALL non-duplicate issues
        List<Issue> allIssues =
                issueRepository
                        .findByDuplicateFalse();

        DuplicateResult best =
                new DuplicateResult();
        best.setDuplicate(false);
        best.setScore(0);

        for (Issue existing : allIssues) {
            double score = score(
                    title, description,
                    issueType, city, district,
                    taluk, wardNumber, pincode,
                    address, existing
            );

            if (score > best.getScore()) {
                best.setScore(score);
                best.setMatchedIssue(existing);
            }
        }

        // Threshold: 60 points = duplicate
        if (best.getScore() >= 60.0) {
            best.setDuplicate(true);
        }

        return best;
    }

    private double score(
            String title,
            String description,
            String issueType,
            String city,
            String district,
            String taluk,
            String wardNumber,
            String pincode,
            String address,
            Issue ex) {

        double total = 0;

        // ─────────────────────────────────
        // Issue Type Match → +20
        // ─────────────────────────────────
        if (issueType != null
                && ex.getIssueType() != null
                && issueType.trim()
                .equalsIgnoreCase(
                        ex.getIssueType()
                                .trim())) {
            total += 20;
        }

        // ─────────────────────────────────
        // Same Ward → +25
        // ─────────────────────────────────
        if (wardNumber != null
                && ex.getWardNumber() != null
                && !wardNumber.trim().isEmpty()
                && wardNumber.trim()
                .equalsIgnoreCase(
                        ex.getWardNumber()
                                .trim())) {
            total += 25;
        }

        // ─────────────────────────────────
        // Same Pincode → +15
        // ─────────────────────────────────
        if (pincode != null
                && ex.getPincode() != null
                && !pincode.trim().isEmpty()
                && pincode.trim()
                .equalsIgnoreCase(
                        ex.getPincode()
                                .trim())) {
            total += 15;
        }

        // ─────────────────────────────────
        // Same Taluk → +10
        // ─────────────────────────────────
        if (taluk != null
                && ex.getTaluk() != null
                && !taluk.trim().isEmpty()
                && taluk.trim()
                .equalsIgnoreCase(
                        ex.getTaluk()
                                .trim())) {
            total += 10;
        }

        // ─────────────────────────────────
        // Address Similarity → +10
        // ─────────────────────────────────
        if (address != null
                && ex.getAddress() != null) {
            double addrSim = wordOverlap(
                    address.toLowerCase(),
                    ex.getAddress().toLowerCase()
            );
            if (addrSim >= 0.3) {
                total += addrSim * 10;
            }
        }

        // ─────────────────────────────────
        // Title Similarity → +10
        // ─────────────────────────────────
        if (title != null
                && ex.getTitle() != null) {
            double titleSim = semanticSim(
                    title.toLowerCase(),
                    ex.getTitle().toLowerCase()
            );
            total += titleSim * 10;
        }

        // ─────────────────────────────────
        // Description Keywords → +10
        // ─────────────────────────────────
        if (description != null
                && ex.getDescription() != null) {
            double descSim = semanticSim(
                    description.toLowerCase(),
                    ex.getDescription().toLowerCase()
            );
            total += descSim * 10;
        }

        // If no location match, reduce score
        boolean hasLocation =
                (wardNumber != null &&
                        ex.getWardNumber() != null &&
                        wardNumber.trim().equalsIgnoreCase(
                                ex.getWardNumber().trim())) ||
                        (pincode != null &&
                                ex.getPincode() != null &&
                                pincode.trim().equalsIgnoreCase(
                                        ex.getPincode().trim())) ||
                        (taluk != null &&
                                ex.getTaluk() != null &&
                                taluk.trim().equalsIgnoreCase(
                                        ex.getTaluk().trim()));

        if (!hasLocation) {
            total = total * 0.3;
        }

        return Math.min(total, 100.0);
    }

    private double semanticSim(
            String t1, String t2) {
        if (t1 == null || t2 == null)
            return 0.0;
        if (t1.equals(t2)) return 1.0;

        Set<String> g1 = getGroups(t1);
        Set<String> g2 = getGroups(t2);

        if (!g1.isEmpty() && !g2.isEmpty()) {
            Set<String> common =
                    new HashSet<>(g1);
            common.retainAll(g2);
            if (!common.isEmpty()) {
                double gs = (double)
                        common.size() /
                        Math.max(g1.size(),
                                g2.size());
                return Math.max(gs,
                        wordOverlap(t1, t2));
            }
        }

        return wordOverlap(t1, t2);
    }

    private double wordOverlap(
            String t1, String t2) {
        Set<String> stopWords = new HashSet<>(
                Arrays.asList("the", "a", "an",
                        "is", "in", "at", "on", "of",
                        "to", "and", "or", "for",
                        "my", "our", "there", "this",
                        "that", "has", "was", "are",
                        "been", "have", "near",
                        "street", "area", "road"));

        Set<String> w1 = new HashSet<>(
                Arrays.asList(t1.split("\\s+")));
        Set<String> w2 = new HashSet<>(
                Arrays.asList(t2.split("\\s+")));
        w1.removeAll(stopWords);
        w2.removeAll(stopWords);

        if (w1.isEmpty() || w2.isEmpty())
            return 0.0;

        Set<String> common = new HashSet<>(w1);
        common.retainAll(w2);

        return (double) common.size() /
                Math.max(w1.size(), w2.size());
    }

    private Set<String> getGroups(String text) {
        Set<String> groups = new HashSet<>();
        for (Map.Entry<String, List<String>>
                e : KEYWORD_GROUPS.entrySet()) {
            for (String kw : e.getValue()) {
                if (text.contains(kw)) {
                    groups.add(e.getKey());
                    break;
                }
            }
        }
        return groups;
    }

    // ─────────────────────────────────────
    // Result class
    // ─────────────────────────────────────
    public static class DuplicateResult {
        private boolean duplicate;
        private double score;
        private Issue matchedIssue;

        public boolean isDuplicate() {
            return duplicate;
        }
        public void setDuplicate(
                boolean d) {
            this.duplicate = d;
        }
        public double getScore() {
            return score;
        }
        public void setScore(double s) {
            this.score = s;
        }
        public Issue getMatchedIssue() {
            return matchedIssue;
        }
        public void setMatchedIssue(
                Issue i) {
            this.matchedIssue = i;
        }
    }
}