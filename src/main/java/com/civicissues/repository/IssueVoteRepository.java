package com.civicissues.repository;

import com.civicissues.entity.Issue;
import com.civicissues.entity.IssueVote;
import com.civicissues.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueVoteRepository extends JpaRepository<IssueVote, Long> {

    // Check if a citizen has already voted on an issue
    boolean existsByIssueAndUser(Issue issue, User user);

    // Find vote by issue and user
    Optional<IssueVote> findByIssueAndUser(Issue issue, User user);

    // Find all votes for an issue
    List<IssueVote> findByIssue(Issue issue);

    // Find all votes by a citizen
    List<IssueVote> findByUser(User user);

    // Count total votes for an issue
    long countByIssue(Issue issue);

    // Count total votes by a citizen
    long countByUser(User user);

    // Get all issue IDs voted by a citizen
    @Query("SELECT v.issue.id FROM IssueVote v WHERE v.user.id = :userId")
    List<Long> findVotedIssueIdsByUser(@Param("userId") Long userId);

    // Delete vote by issue and user
    void deleteByIssueAndUser(Issue issue, User user);

    @Query("SELECT i FROM Issue i WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(i.title) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
            "LOWER(i.issueType) LIKE LOWER(CONCAT('%',:keyword,'%'))) AND " +
            "(:city IS NULL OR LOWER(i.city) = LOWER(:city)) AND " +
            "(:wardNumber IS NULL OR i.wardNumber = :wardNumber) AND " +
            "(:pincode IS NULL OR i.pincode = :pincode) AND " +
            "(:issueType IS NULL OR LOWER(i.issueType) = LOWER(:issueType)) " +
            "ORDER BY i.priorityScore DESC")
    List<Issue> searchIssuesAdvanced(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("wardNumber") String wardNumber,
            @Param("pincode") String pincode,
            @Param("issueType") String issueType
    );
}

