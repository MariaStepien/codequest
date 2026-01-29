package com.codequest.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.codequest.demo.dto.CourseProgressByUserDetailsDto;
import com.codequest.demo.model.Course;
import com.codequest.demo.model.User;
import com.codequest.demo.model.UserCourseProgress;
import com.codequest.demo.repository.CourseRepository;
import com.codequest.demo.repository.UserCourseProgressRepository;
import com.codequest.demo.repository.UserRepository;

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
    }

    public Optional<LatestActivityDto> getLatestActivity(Long userId) {
        return userCourseProgressRepository.findLatestProgressByUserId(userId)
            .map(progress -> {
                LatestActivityDto dto = new LatestActivityDto();
                dto.setCourseId(progress.getCourse().getId());
                dto.setCourseTitle(progress.getCourse().getTitle());
                dto.setCompletedLevelOrderIndex(progress.getCompletedLessons());
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
            }

            if (newCompletedLessons == course.getTotalLessons()) {
                progress.setIsFinished(true);
            }
            
        } else {
            progress = new UserCourseProgress();
            progress.setUser(user); 
            progress.setCourse(course); 
            progress.setCompletedLessons(newCompletedLessons);
            progress.setIsFinished(false);
        }
        
        return userCourseProgressRepository.save(progress);
    }

    public List<CourseProgressByUserDetailsDto> getCourseProgressForAllUsers(Long courseId) {
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kursu z ID: " + courseId));
        
        List<UserCourseProgress> progressRecords = userCourseProgressRepository.findByCourseId(courseId);
        
        int totalLessons = course.getTotalLessons();

        return progressRecords.stream()
            .map(progress -> {
                return CourseProgressByUserDetailsDto.builder()
                        .userId(progress.getUser().getId())
                        .userLogin(progress.getUser().getUserLogin())
                        .completedLessons(progress.getCompletedLessons())
                        .totalLessons(totalLessons)
                        .isCourseCompleted(progress.getIsFinished())
                        .build();
            })
            .collect(Collectors.toList());
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