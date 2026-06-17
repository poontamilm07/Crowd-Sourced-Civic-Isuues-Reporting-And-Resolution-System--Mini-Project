package com.civicissues.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    // Issue type
    @NotBlank(message = "Issue type is required")
    private String issueType;

    // Custom issue type if issueType is OTHER
    private String customIssueType;

    // Urgency: LOW, MEDIUM, HIGH
    @NotBlank(message = "Urgency level is required")
    private String urgencyLevel;

    // Is emergency issue
    private boolean emergency = false;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private String landmark;

    private String wardNumber;
    private String taluk;

    // Reported date
    private LocalDate reportedDate;

    // Image will be handled as MultipartFile in controller
}