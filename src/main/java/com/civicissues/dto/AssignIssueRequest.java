package com.civicissues.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignIssueRequest {

    // ID of the authority to assign
    @NotNull(message = "Authority ID is required")
    private Long authorityId;

    // Number of workers assigned
    private int workerCount;

    // Expected completion date
    private LocalDate expectedCompletionDate;
}