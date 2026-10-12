package com.careerconnect.controller;

import com.careerconnect.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "Endpoints for downloading uploaded candidate resumes and documents")
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/download/**")
    @Operation(summary = "Download candidate resume file")
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) {
        // Extract relative path from request URI
        String fullPath = request.getRequestURI();
        String relativePath = fullPath.substring(fullPath.indexOf("/api/files/download/") + "/api/files/download/".length());

        Resource resource = fileStorageService.loadAsResource(relativePath);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
