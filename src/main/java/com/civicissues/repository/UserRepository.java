package com.civicissues.repository;

import com.civicissues.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if email already exists
    boolean existsByEmail(String email);

    // Find all users by role
    List<User> findByRole(String role);

    // Find all users by status
    List<User> findByStatus(String status);

    // Find all users by role and status
    List<User> findByRoleAndStatus(String role, String status);

    // Find all authorities by department
    List<User> findByRoleAndDepartment(String role, String department);

    // Count total citizens
    long countByRole(String role);

    // Count users by role and status
    long countByRoleAndStatus(String role, String status);

    // Check if admin already exists
    boolean existsByRole(String role);

    // Find authority by email
    Optional<User> findByEmailAndRole(String email, String role);

    // Search users by name or email
    @Query("SELECT u FROM User u WHERE u.role = :role AND " +
            "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchByRoleAndKeyword(
            @Param("role") String role,
            @Param("keyword") String keyword
    );

    // Find all approved authorities
    @Query("SELECT u FROM User u WHERE u.role = 'AUTHORITY' AND u.status = 'APPROVED'")
    List<User> findAllApprovedAuthorities();

    // Find authorities by department who are approved
    @Query("SELECT u FROM User u WHERE u.role = 'AUTHORITY' " +
            "AND u.status = 'APPROVED' AND u.department = :department")
    List<User> findApprovedAuthoritiesByDepartment(@Param("department") String department);
}
