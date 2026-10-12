package com.careerconnect.repository;

import com.careerconnect.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    Optional<SavedJob> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    void deleteByJobIdAndCandidateId(Long jobId, Long candidateId);

    @Query("SELECT s FROM SavedJob s JOIN FETCH s.job j JOIN FETCH j.company WHERE s.candidate.id = :candidateId ORDER BY s.createdAt DESC")
    Page<SavedJob> findByCandidateIdWithDetails(@Param("candidateId") Long candidateId, Pageable pageable);

    @Query("SELECT s.job.id FROM SavedJob s WHERE s.candidate.id = :candidateId")
    List<Long> findSavedJobIdsByCandidateId(@Param("candidateId") Long candidateId);

    long countByCandidateId(Long candidateId);
}
