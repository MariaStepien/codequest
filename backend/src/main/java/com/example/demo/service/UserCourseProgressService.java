package com.example.demo.service;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Course;
import com.example.demo.domain.User;
import com.example.demo.domain.UserCourseProgress;
import com.example.demo.repos.CourseRepository;
import com.example.demo.repos.UserCourseProgressRepository;
import com.example.demo.repos.UserRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserCourseProgressService {
    
    private final UserCourseProgressRepository userCourseProgressRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Data
    public static class LatestActivityDto {
        private Long courseId;
        private String courseTitle;
        private int completedLevelOrderIndex;
        private OffsetDateTime lastUpdated;
    }

    public Optional<LatestActivityDto> getLatestActivity(Long userId) {
        return userCourseProgressRepository.findLatestProgressByUserId(userId)
            .map(progress -> {
                LatestActivityDto dto = new LatestActivityDto();
                dto.setCourseId(progress.getCourse().getId());
                dto.setCourseTitle(progress.getCourse().getTitle());
                dto.setCompletedLevelOrderIndex(progress.getCompletedLessons());
                dto.setLastUpdated(progress.getLastUpdated());
                return dto;
            });
    }

    public UserCourseProgress updateProgress(Long userId, Long courseId, int newCompletedLessons) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika z ID: " + userId));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kursu z ID: " + courseId));
        
        Optional<UserCourseProgress> existingProgress = userCourseProgressRepository
                .findByUserIdAndCourseId(userId, courseId);

        UserCourseProgress progress;
        
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            
            if (newCompletedLessons > progress.getCompletedLessons()) {
                progress.setCompletedLessons(newCompletedLessons);
                progress.setLastUpdated(OffsetDateTime.now());
            }
            
        } else {
            progress = new UserCourseProgress();
            progress.setUser(user); 
            progress.setCourse(course); 
            progress.setCompletedLessons(newCompletedLessons);
            progress.setDateCreated(OffsetDateTime.now());
            progress.setLastUpdated(OffsetDateTime.now());
        }
        
        return userCourseProgressRepository.save(progress);
    }

    /**
     * Retrieves the number of completed lessons for a specific user and course.
     * Returns 0 if no progress record is found (user has not started the course).
     */
    public int getCompletedLevelsForCourse(Long userId, Long courseId) {
        return userCourseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .map(UserCourseProgress::getCompletedLessons)
                .orElse(0);
    }
}