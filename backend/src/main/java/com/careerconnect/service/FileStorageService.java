package com.careerconnect.service;

import com.careerconnect.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${careerconnect.upload.directory:./uploads}")
    private String uploadDir;

    private Path rootLocation;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".pdf", ".docx");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/octet-stream"
    );

    @PostConstruct
    public void init() {
        try {
            this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.rootLocation);
            Files.createDirectories(this.rootLocation.resolve("resumes"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage folder: " + uploadDir, e);
        }
    }

    public static class StoredFile {
        private final String relativePath;
        private final String originalFilename;

        public StoredFile(String relativePath, String originalFilename) {
            this.relativePath = relativePath;
            this.originalFilename = originalFilename;
        }

        public String getRelativePath() {
            return relativePath;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }
    }

    public StoredFile storeResume(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf"
        );

        // Security check against directory traversal
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid filename with path traversal characters: " + originalFilename);
        }

        // Validate extension
        String lowerFilename = originalFilename.toLowerCase();
        boolean validExt = ALLOWED_EXTENSIONS.stream().anyMatch(lowerFilename::endsWith);
        if (!validExt) {
            throw new BadRequestException("Invalid file format. Only PDF and DOCX files are permitted.");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file content type: " + contentType);
        }

        // Generate safe unique filename
        String ext = lowerFilename.substring(lowerFilename.lastIndexOf('.'));
        String uniqueName = UUID.randomUUID().toString() + ext;
        Path destinationFolder = this.rootLocation.resolve("resumes");
        Path destinationFile = destinationFolder.resolve(uniqueName).normalize();

        // Verify traversal safety
        if (!destinationFile.startsWith(destinationFolder)) {
            throw new BadRequestException("Cannot store file outside directory structure.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            return new StoredFile("resumes/" + uniqueName, originalFilename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    public Resource loadAsResource(String relativePath) {
        try {
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            if (!filePath.startsWith(this.rootLocation)) {
                throw new BadRequestException("Invalid file access path.");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("File not found or cannot be read: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new BadRequestException("Could not read file: " + relativePath);
        }
    }
}
