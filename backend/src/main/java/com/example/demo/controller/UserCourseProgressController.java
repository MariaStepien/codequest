package com.example.demo.controller;

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

import com.example.demo.domain.UserCourseProgress;
import com.example.demo.dto.CourseProgressByUserDetailsDto;
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

    /**
     * Protected endpoint to fetch the user's single latest progress activity.
     */
    @GetMapping("/latest-activity")
    public ResponseEntity<Optional<UserCourseProgressService.LatestActivityDto>> getLatestActivity(
            @AuthenticationPrincipal UserDetails userDetails) {

        // Add a null check here to avoid the NPE you experienced previously
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.parseLong(userDetails.getUsername());

        // Delegate to the service to get the latest activity DTO
        Optional<UserCourseProgressService.LatestActivityDto> latestActivity = 
            progressService.getLatestActivity(userId);

        // Return 200 OK with the DTO (or empty if no progress exists)
        return ResponseEntity.ok(latestActivity);
    }

    @GetMapping("/list-users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseProgressByUserDetailsDto>> getCourseProgressForAllUsers(@PathVariable Long id) {
        
        List<CourseProgressByUserDetailsDto> progressList = 
            progressService.getCourseProgressForAllUsers(id);
        
        return ResponseEntity.ok(progressList);
    }
}