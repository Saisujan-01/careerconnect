package com.careerconnect.repository;

import com.careerconnect.entity.EmploymentType;
import com.careerconnect.entity.Job;
import com.careerconnect.entity.JobStatus;
import com.careerconnect.entity.ModerationStatus;
import com.careerconnect.entity.WorkplaceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    @Query("SELECT j FROM Job j JOIN FETCH j.company JOIN FETCH j.recruiter WHERE " +
           "j.status = 'PUBLISHED' AND j.moderationStatus = 'APPROVED' AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:category IS NULL OR LOWER(j.category) = LOWER(:category)) AND " +
           "(:workplaceType IS NULL OR j.workplaceType = :workplaceType) AND " +
           "(:employmentType IS NULL OR j.employmentType = :employmentType) AND " +
           "(:minSalary IS NULL OR (j.salaryMax IS NOT NULL AND j.salaryMax >= :minSalary) OR (j.salaryMin IS NOT NULL AND j.salaryMin >= :minSalary)) AND " +
           "(:maxSalary IS NULL OR (j.salaryMin IS NOT NULL AND j.salaryMin <= :maxSalary) OR (j.salaryMax IS NOT NULL AND j.salaryMax <= :maxSalary))")
    Page<Job> searchPublicJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("category") String category,
            @Param("workplaceType") WorkplaceType workplaceType,
            @Param("employmentType") EmploymentType employmentType,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            Pageable pageable
    );

    Page<Job> findByRecruiterId(Long recruiterId, Pageable pageable);

    Page<Job> findByRecruiterIdAndStatus(Long recruiterId, JobStatus status, Pageable pageable);

    long countByStatus(JobStatus status);

    long countByRecruiterId(Long recruiterId);

    long countByRecruiterIdAndStatus(Long recruiterId, JobStatus status);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = 'PUBLISHED' AND j.moderationStatus = 'APPROVED' ORDER BY j.createdAt DESC")
    List<Job> findTopFeaturedJobs(Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = 'PUBLISHED' AND j.moderationStatus = 'APPROVED' AND j.category = :category AND j.id <> :excludeJobId")
    List<Job> findRelatedJobs(@Param("category") String category, @Param("excludeJobId") Long excludeJobId, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = 'PUBLISHED' AND j.moderationStatus = 'APPROVED' AND (" +
           "LOWER(j.category) = LOWER(:category) OR " +
           "LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Job> findRecommendedJobs(@Param("category") String category, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.company JOIN FETCH j.recruiter WHERE " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:moderationStatus IS NULL OR j.moderationStatus = :moderationStatus)")
    Page<Job> searchAdminJobs(
            @Param("keyword") String keyword,
            @Param("status") JobStatus status,
            @Param("moderationStatus") ModerationStatus moderationStatus,
            Pageable pageable
    );
}
