package com.civicissues.repository;

import com.civicissues.entity.Feedback;
import com.civicissues.entity.Issue;
import com.civicissues.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Find feedback by issue
    Optional<Feedback> findByIssue(Issue issue);

    // Check if feedback already exists for an issue
    boolean existsByIssue(Issue issue);

    // Find all feedbacks submitted by a citizen
    List<Feedback> findByCitizenOrderBySubmittedAtDesc(User citizen);

    // Find all feedbacks for an authority
    List<Feedback> findByAuthorityOrderBySubmittedAtDesc(User authority);

    // Count total feedbacks for an authority
    long countByAuthority(User authority);

    // Get average star rating for an authority
    @Query("SELECT AVG(f.starRating) FROM Feedback f " +
            "WHERE f.authority.id = :authorityId")
    Double getAverageRatingByAuthority(@Param("authorityId") Long authorityId);

    // Get total feedbacks with each star rating for an authority
    @Query("SELECT f.starRating, COUNT(f) FROM Feedback f " +
            "WHERE f.authority.id = :authorityId " +
            "GROUP BY f.starRating ORDER BY f.starRating DESC")
    List<Object[]> getRatingDistributionByAuthority(
            @Param("authorityId") Long authorityId
    );

    // Get overall average rating of all authorities
    @Query("SELECT AVG(f.starRating) FROM Feedback f")
    Double getOverallAverageRating();

    // Get top performing authorities by average rating
    @Query("SELECT f.authority.id, f.authority.name, " +
            "AVG(f.starRating) as avgRating, COUNT(f) as totalFeedbacks " +
            "FROM Feedback f GROUP BY f.authority.id, f.authority.name " +
            "ORDER BY avgRating DESC")
    List<Object[]> getTopPerformingAuthorities();

    // Get recent feedbacks for admin dashboard
    @Query("SELECT f FROM Feedback f ORDER BY f.submittedAt DESC")
    List<Feedback> findRecentFeedbacks();

    // Find feedbacks by star rating
    List<Feedback> findByStarRating(int starRating);

    // Get authority performance summary
    @Query("SELECT f.authority.id, f.authority.name, " +
            "f.authority.department, " +
            "AVG(f.starRating) as avgRating, " +
            "COUNT(f) as totalResolved " +
            "FROM Feedback f " +
            "WHERE f.authority.id = :authorityId " +
            "GROUP BY f.authority.id, f.authority.name, f.authority.department")
    List<Object[]> getAuthorityPerformanceSummary(
            @Param("authorityId") Long authorityId
    );
}
