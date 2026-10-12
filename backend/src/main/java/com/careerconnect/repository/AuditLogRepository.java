package com.careerconnect.repository;

import com.careerconnect.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user WHERE " +
           "(:action IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :action, '%'))) AND " +
           "(:entityType IS NULL OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :entityType, '%')))")
    Page<AuditLog> searchLogs(@Param("action") String action, @Param("entityType") String entityType, Pageable pageable);
}
