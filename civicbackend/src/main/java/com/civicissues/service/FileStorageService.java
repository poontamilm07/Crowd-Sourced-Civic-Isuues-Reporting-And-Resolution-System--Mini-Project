package com.civicissues.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Allowed image types
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    // Max file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Save ID card photo
    public String saveIdCardPhoto(MultipartFile file,
                                  String userEmail) throws IOException {
        return saveFile(file, "idcards", userEmail);
    }

    // Save issue reported image (before image)
    public String saveIssueImage(MultipartFile file,
                                 String issueCode) throws IOException {
        return saveFile(file, "issues/before", issueCode);
    }

    // Save issue after completion image
    public String saveAfterImage(MultipartFile file,
                                 String issueCode) throws IOException {
        return saveFile(file, "issues/after", issueCode);
    }

    // Core file saving method
    private String saveFile(MultipartFile file,
                            String subFolder, String prefix) throws IOException {

        // Validate file is not empty
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null ||
                !ALLOWED_TYPES.contains(contentType)) {
            throw new IOException(
                    "Invalid file type. Only images are allowed."
            );
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException(
                    "File size exceeds 10MB limit."
            );
        }

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, subFolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique file name
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null &&
                originalFileName.contains(".")) {
            extension = originalFileName.substring(
                    originalFileName.lastIndexOf(".")
            );
        }

        String uniqueFileName = prefix + "_"
                + UUID.randomUUID().toString() + extension;

        // Save file to disk
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        // Return relative path for storing in database
        return "/uploads/" + subFolder + "/" + uniqueFileName;
    }

    // Delete a file
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        try {
            // Remove leading slash and uploads/ prefix
            String relativePath = filePath
                    .replaceFirst("^/uploads/", "");
            Path path = Paths.get(uploadDir, relativePath);

            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            System.err.println(
                    "Failed to delete file: " + e.getMessage()
            );
        }
    }

    // Check if file exists
    public boolean fileExists(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }
        try {
            String relativePath = filePath
                    .replaceFirst("^/uploads/", "");
            Path path = Paths.get(uploadDir, relativePath);
            return Files.exists(path);
        } catch (Exception e) {
            return false;
        }
    }

    // Get file size in KB
    public long getFileSizeKb(String filePath) {
        try {
            String relativePath = filePath
                    .replaceFirst("^/uploads/", "");
            Path path = Paths.get(uploadDir, relativePath);
            return Files.size(path) / 1024;
        } catch (IOException e) {
            return 0;
        }
    }
}
