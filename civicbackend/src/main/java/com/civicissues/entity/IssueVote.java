package com.civicissues.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "issue_votes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"issue_id", "user_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The issue that was voted on
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    // The citizen who voted
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // When the vote was cast
    private LocalDateTime votedAt;

    @PrePersist
    public void prePersist() {
        this.votedAt = LocalDateTime.now();
    }
}
