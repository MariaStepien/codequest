package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.UserCourseProgress;
import com.example.demo.service.UserCourseProgressService;

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
     * Protected endpoint to update or create user course progress.
     */
    @PutMapping("/update")
    public ResponseEntity<UserCourseProgress> updateProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProgressUpdateRequest request) {
        
        Long userId = Long.parseLong(userDetails.getUsername());
        
        UserCourseProgress updatedProgress = progressService.updateProgress(
            userId, 
            request.getCourseId(), 
            request.getCompletedLevelOrderIndex()
        );
        
        return ResponseEntity.ok(updatedProgress);
    }
}