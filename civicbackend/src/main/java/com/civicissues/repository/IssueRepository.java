package com.civicissues.repository;

import com.civicissues.entity.Issue;
import com.civicissues.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    // Find issue by issue code like ISS1023
    Optional<Issue> findByIssueCode(String issueCode);

    // Find all issues by citizen
    List<Issue> findByCitizenOrderByReportedAtDesc(User citizen);

    // Find all issues by authority
    List<Issue> findByAuthorityOrderByReportedAtDesc(User authority);

    List<Issue> findByDuplicateFalse();

    // Find all issues by status
    List<Issue> findByStatusOrderByPriorityScoreDesc(String status);

    // Find all issues by city
    List<Issue> findByCityOrderByReportedAtDesc(String city);

    // Find all issues by pincode
    List<Issue> findByPincodeOrderByReportedAtDesc(String pincode);

    // Find all issues by ward number
    List<Issue> findByWardNumberOrderByReportedAtDesc(String wardNumber);

    // Find all issues by issue type
    List<Issue> findByIssueTypeOrderByReportedAtDesc(String issueType);

    // Find all emergency issues
    List<Issue> findByEmergencyTrueOrderByReportedAtDesc();

    // Find all duplicate issues
    List<Issue> findByDuplicateTrueOrderByReportedAtDesc();

    // Find issues by city and status
    List<Issue> findByCityAndStatusOrderByPriorityScoreDesc(
            String city, String status
    );

    // Find issues by authority and status
    List<Issue> findByAuthorityAndStatusOrderByReportedAtDesc(
            User authority, String status
    );

    // Count issues by status
    long countByStatus(String status);

    // Count issues by citizen
    long countByCitizen(User citizen);

    // Count issues by authority
    long countByAuthority(User authority);

    // Count issues by authority and status
    long countByAuthorityAndStatus(User authority, String status);

    // Find overdue issues (reported more than 48 hours ago and still REPORTED)
    @Query("SELECT i FROM Issue i WHERE i.status = 'REPORTED' " +
            "AND i.reportedAt < :cutoffTime ORDER BY i.reportedAt ASC")
    List<Issue> findOverdueIssues(@Param("cutoffTime") LocalDateTime cutoffTime);

    // Search issues by title, address or issue code
    @Query("SELECT i FROM Issue i WHERE " +
            "LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.issueCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Issue> searchIssues(@Param("keyword") String keyword);

    // Search issues by city and keyword
    @Query("SELECT i FROM Issue i WHERE i.city = :city AND (" +
            "LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.issueCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Issue> searchIssuesByCity(
            @Param("city") String city,
            @Param("keyword") String keyword
    );

    // Get issue count by type for analytics
    @Query("SELECT i.issueType, COUNT(i) FROM Issue i GROUP BY i.issueType")
    List<Object[]> countIssuesByType();

    // Get issue count by status for analytics
    @Query("SELECT i.status, COUNT(i) FROM Issue i GROUP BY i.status")
    List<Object[]> countIssuesByStatus();

    // Get top voted issues by city
    @Query("SELECT i FROM Issue i WHERE i.city = :city " +
            "ORDER BY i.voteCount DESC")
    List<Issue> findTopVotedIssuesByCity(@Param("city") String city);

    // Find issues by authority department
    @Query("SELECT i FROM Issue i WHERE i.authority.department = :department " +
            "ORDER BY i.reportedAt DESC")
    List<Issue> findIssuesByDepartment(@Param("department") String department);

    // Find issues by ward and status
    @Query("SELECT i FROM Issue i WHERE i.wardNumber = :ward " +
            "AND i.status = :status ORDER BY i.priorityScore DESC")
    List<Issue> findByWardAndStatus(
            @Param("ward") String ward,
            @Param("status") String status
    );

    // Get authority performance - count completed issues per authority
    @Query("SELECT i.authority.id, i.authority.name, COUNT(i) " +
            "FROM Issue i WHERE i.status = 'COMPLETED' " +
            "GROUP BY i.authority.id, i.authority.name")
    List<Object[]> getAuthorityPerformance();

    // Find issues reported by citizen in same city (public issues)
    @Query("SELECT i FROM Issue i WHERE i.city = :city " +
            "AND i.citizen.id != :citizenId " +
            "ORDER BY i.voteCount DESC")
    List<Issue> findPublicIssuesByCity(
            @Param("city") String city,
            @Param("citizenId") Long citizenId
    );
    @Query("SELECT i FROM Issue i WHERE " +
            "((:keyword IS NULL) OR " +
            "(LOWER(i.title) LIKE LOWER(CONCAT('%',:keyword,'%'))) OR " +
            "(LOWER(i.description) LIKE LOWER(CONCAT('%',:keyword,'%'))) OR " +
            "(LOWER(i.issueType) LIKE LOWER(CONCAT('%',:keyword,'%')))) " +
            "AND ((:city IS NULL) OR (LOWER(i.city) LIKE LOWER(CONCAT('%',:city,'%')))) " +
            "AND ((:wardNumber IS NULL) OR (i.wardNumber = :wardNumber)) " +
            "AND ((:pincode IS NULL) OR (i.pincode = :pincode)) " +
            "AND ((:taluk IS NULL) OR (LOWER(i.taluk) LIKE LOWER(CONCAT('%',:taluk,'%')))) " +
            "AND ((:issueType IS NULL) OR (LOWER(i.issueType) LIKE LOWER(CONCAT('%',:issueType,'%')))) " +
            "ORDER BY i.voteCount DESC, i.priorityScore DESC")
    List<Issue> searchIssuesAdvanced(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("wardNumber") String wardNumber,
            @Param("pincode") String pincode,
            @Param("taluk") String taluk,
            @Param("issueType") String issueType
    );

    @Query("SELECT i FROM Issue i WHERE " +
            "i.duplicate = false AND " +
            "(LOWER(i.title) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
            "LOWER(i.issueType) LIKE LOWER(CONCAT('%',:keyword,'%'))) AND " +
            "((:pincode IS NULL) OR i.pincode = :pincode) AND " +
            "((:wardNumber IS NULL) OR i.wardNumber = :wardNumber) " +
            "ORDER BY i.voteCount DESC")
    List<Issue> searchBeforeReport(
            @Param("keyword") String keyword,
            @Param("pincode") String pincode,
            @Param("wardNumber") String wardNumber
    );
}
