package com.careerconnect.service;

import com.careerconnect.entity.AuditLog;
import com.careerconnect.entity.User;
import com.careerconnect.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String action, String entityType, Long entityId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception ignored) {
            // Non-critical logging fallback
        }
    }
}
