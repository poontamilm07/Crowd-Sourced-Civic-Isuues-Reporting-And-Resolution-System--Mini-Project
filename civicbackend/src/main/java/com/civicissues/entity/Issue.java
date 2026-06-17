package com.civicissues.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Auto-generated Issue ID like ISS1023
    @Column(unique = true)
    private String issueCode;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Issue type: Road, Garbage, Street Light, Water, Drainage,
    // Manhole, Illegal Dumping, Public Property, Flood, Tree, Other
    private String issueType;

    // If issueType is Other, store custom type here
    private String customIssueType;

    // Urgency: LOW, MEDIUM, HIGH
    private String urgencyLevel;

    // Is this an emergency issue
    private boolean emergency = false;

    // Reported image (before image) - uploaded by citizen
    private String reportedImage;

    // After image - uploaded by authority after completion
    private String afterImage;

    private String address;
    private String city;
    private String pincode;
    private String landmark;
    private String wardNumber;

    // Date citizen reported the issue
    private LocalDate reportedDate;

    // Status: REPORTED, ASSIGNED, WORK_ASSIGNED, IN_PROGRESS, COMPLETED
    @Column(nullable = false)
    private String status;
    @Column(name = "taluk")
    private String taluk;

    // Priority score = votes + severity + time pending
    private int priorityScore = 0;

    // Vote count
    private int voteCount = 0;

    // Expected completion date set by admin
    private LocalDate expectedCompletionDate;

    // Number of workers assigned
    private int workerCount = 0;

    // Timeline timestamps
    private LocalDateTime reportedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime workAssignedAt;
    private LocalDateTime workStartedAt;
    private LocalDateTime completedAt;

    // Duplicate flag
    private boolean duplicate = false;

    // Citizen who reported
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id")
    private User citizen;

    // Authority assigned to this issue
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authority_id")
    private User authority;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Issue parentIssue;

    @Column(name = "report_count")
    private int reportCount = 1;

    @PrePersist
    public void prePersist() {
        this.reportedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "REPORTED";
        }
        if (this.reportedDate == null) {
            this.reportedDate = LocalDate.now();
        }
    }

    // Generate Issue Code like ISS1023
    public void generateIssueCode() {
        this.issueCode = "ISS" + (1000 + this.id);
    }
}
