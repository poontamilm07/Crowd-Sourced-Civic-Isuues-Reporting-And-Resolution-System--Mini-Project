package com.civicissues.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Role: CITIZEN or AUTHORITY
    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Village or Area is required")
    private String villageOrArea;

    @NotBlank(message = "Ward number is required")
    private String wardNumber;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotBlank(message = "Address is required")
    private String address;

    // For Authority role only
    private String department;

    // For Authority role only
    private String contactNumber;


    private String taluk;

    private String dateOfBirth;

    // ID card photo will be handled as MultipartFile
    // in the controller separately
}