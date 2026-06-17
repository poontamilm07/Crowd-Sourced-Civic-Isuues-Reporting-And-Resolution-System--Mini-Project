package com.civicissues.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {

    // Issue ID to submit feedback for
    @NotNull(message = "Issue ID is required")
    private Long issueId;

    // Star rating 1 to 5
    @NotNull(message = "Star rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int starRating;

    // Optional comment
    private String comment;
}

