package com.careerconnect.security;

import com.careerconnect.entity.Role;
import com.careerconnect.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtils {

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return Optional.of((UserPrincipal) authentication.getPrincipal());
        }
        return Optional.empty();
    }

    public static UserPrincipal getRequiredCurrentUserPrincipal() {
        return getCurrentUserPrincipal()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated. Please log in."));
    }

    public static Long getCurrentUserId() {
        return getRequiredCurrentUserPrincipal().getId();
    }

    public static Role getCurrentUserRole() {
        return getRequiredCurrentUserPrincipal().getRole();
    }

    public static boolean isCandidate() {
        return getCurrentUserPrincipal().map(u -> u.getRole() == Role.CANDIDATE).orElse(false);
    }

    public static boolean isRecruiter() {
        return getCurrentUserPrincipal().map(u -> u.getRole() == Role.RECRUITER).orElse(false);
    }

    public static boolean isAdmin() {
        return getCurrentUserPrincipal().map(u -> u.getRole() == Role.ADMIN).orElse(false);
    }
}
