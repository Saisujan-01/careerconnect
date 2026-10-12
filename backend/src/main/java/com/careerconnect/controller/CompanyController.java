package com.careerconnect.controller;

import com.careerconnect.dto.CommonDTO;
import com.careerconnect.dto.JobDTO;
import com.careerconnect.entity.Company;
import com.careerconnect.entity.Job;
import com.careerconnect.exception.ResourceNotFoundException;
import com.careerconnect.repository.CompanyRepository;
import com.careerconnect.repository.JobRepository;
import com.careerconnect.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Endpoints for viewing hiring companies and employer profiles")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;

    @GetMapping
    @Operation(summary = "Search and list hiring companies")
    public ResponseEntity<CommonDTO.ApiResponse<CommonDTO.PagedResponse<JobDTO.CompanySummary>>> getCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Company> companyPage = companyRepository.searchCompanies(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                pageable
        );

        List<JobDTO.CompanySummary> summaries = companyPage.getContent().stream()
                .map(c -> JobDTO.CompanySummary.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .website(c.getWebsite())
                        .industry(c.getIndustry())
                        .location(c.getLocation())
                        .logoUrl(c.getLogoUrl())
                        .build())
                .collect(Collectors.toList());

        CommonDTO.PagedResponse<JobDTO.CompanySummary> response = CommonDTO.PagedResponse.<JobDTO.CompanySummary>builder()
                .content(summaries)
                .page(companyPage.getNumber())
                .size(companyPage.getSize())
                .totalElements(companyPage.getTotalElements())
                .totalPages(companyPage.getTotalPages())
                .isLast(companyPage.isLast())
                .build();

        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company profile and its active job vacancies")
    public ResponseEntity<CommonDTO.ApiResponse<Map<String, Object>>> getCompanyById(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        JobDTO.CompanySummary summary = JobDTO.CompanySummary.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .location(company.getLocation())
                .logoUrl(company.getLogoUrl())
                .build();

        // Get jobs for this company
        List<Job> companyJobs = jobRepository.findAll().stream()
                .filter(j -> j.getCompany().getId().equals(id) && "PUBLISHED".equals(j.getStatus().name()))
                .collect(Collectors.toList());

        List<JobDTO.JobResponse> jobResponses = companyJobs.stream()
                .map(j -> jobService.mapToJobResponse(j, false))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("company", summary);
        result.put("activeJobs", jobResponses);
        result.put("totalJobsCount", jobResponses.size());

        return ResponseEntity.ok(CommonDTO.ApiResponse.ok(result));
    }
}
