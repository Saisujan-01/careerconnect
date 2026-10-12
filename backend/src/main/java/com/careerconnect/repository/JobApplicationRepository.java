package com.careerconnect.repository;

import com.careerconnect.entity.ApplicationStatus;
import com.careerconnect.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    @Query("SELECT a FROM JobApplication a JOIN FETCH a.job j JOIN FETCH j.company WHERE a.candidate.id = :candidateId ORDER BY a.appliedAt DESC")
    Page<JobApplication> findByCandidateIdWithDetails(@Param("candidateId") Long candidateId, Pageable pageable);

    @Query("SELECT a FROM JobApplication a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE j.id = :jobId ORDER BY a.appliedAt DESC")
    Page<JobApplication> findByJobIdWithDetails(@Param("jobId") Long jobId, Pageable pageable);

    @Query("SELECT a FROM JobApplication a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE j.recruiter.id = :recruiterId AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:jobId IS NULL OR j.id = :jobId) AND " +
           "(:keyword IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobApplication> searchRecruiterApplicants(
            @Param("recruiterId") Long recruiterId,
            @Param("jobId") Long jobId,
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT a FROM JobApplication a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE j.recruiter.id = :recruiterId ORDER BY a.appliedAt DESC")
    List<JobApplication> findTop5RecentApplicantsForRecruiter(@Param("recruiterId") Long recruiterId, Pageable pageable);

    long countByJobRecruiterId(Long recruiterId);

    long countByJobRecruiterIdAndStatus(Long recruiterId, ApplicationStatus status);

    long countByCandidateId(Long candidateId);

    long countByCandidateIdAndStatus(Long candidateId, ApplicationStatus status);

    @Query("SELECT a.status, COUNT(a) FROM JobApplication a WHERE a.job.recruiter.id = :recruiterId GROUP BY a.status")
    List<Object[]> countApplicationsByStatusForRecruiter(@Param("recruiterId") Long recruiterId);

    @Query("SELECT a FROM JobApplication a JOIN FETCH a.candidate JOIN FETCH a.job j JOIN FETCH j.company ORDER BY a.appliedAt DESC")
    Page<JobApplication> findAllWithDetails(Pageable pageable);
}
