package com.codequest.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.dto.CourseProgressByUserDetailsDto;
import com.codequest.demo.model.UserCourseProgress;
import com.codequest.demo.service.UserCourseProgressService;

import lombok.Data;

@RestController
@RequestMapping("/api/progress")
public class UserCourseProgressController {
    
    private final UserCourseProgressService progressService;

    public UserCourseProgressController(UserCourseProgressService progressService) {
        this.progressService = progressService;
    }

    /**
     * DTO for incoming progress update request.
     */
    @Data
    static class ProgressUpdateRequest {
        private Long courseId;
        private int completedLevelOrderIndex;
    }

    /**
     * Updates the course progress for the authenticated user.
     * Maps to the /api/progress/update endpoint.
     */
    @PutMapping("/update")
    public ResponseEntity<UserCourseProgress> updateProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProgressUpdateRequest request) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        
        UserCourseProgress updatedProgress = progressService.updateProgress(
            userId, 
            request.getCourseId(), 
            request.getCompletedLevelOrderIndex()
        );
        
        return ResponseEntity.ok(updatedProgress);
    }

    /**
     * Fetches the latest course activity for the authenticated user.
     * Maps to the /api/progress/latest-activity endpoint.
     */
    @GetMapping("/latest-activity")
    public ResponseEntity<Optional<UserCourseProgressService.LatestActivityDto>> getLatestActivity(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(userDetails.getUsername());
        Optional<UserCourseProgressService.LatestActivityDto> latestActivity = progressService.getLatestActivity(userId);

        return ResponseEntity.ok(latestActivity);
    }

    /**
     * Fetches course progress details for all users (Admin only).
     * Maps to the /api/progress/list-users/{id} endpoint.
     */
    @GetMapping("/list-users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseProgressByUserDetailsDto>> getCourseProgressForAllUsers(@PathVariable Long id) {
        
        List<CourseProgressByUserDetailsDto> progressList = 
            progressService.getCourseProgressForAllUsers(id);
        
        return ResponseEntity.ok(progressList);
    }
}