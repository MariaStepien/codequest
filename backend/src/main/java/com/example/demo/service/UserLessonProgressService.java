package com.example.demo.service;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Course;
import com.example.demo.domain.Lesson;
import com.example.demo.domain.User; 
import com.example.demo.domain.UserLessonProgress;
import com.example.demo.dto.UserLessonProgressCreationDto;
import com.example.demo.dto.UserLessonProgressDto;
import com.example.demo.repos.CourseRepository;
import com.example.demo.repos.LessonRepository;
import com.example.demo.repos.UserLessonProgressRepository;
import com.example.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserLessonProgressService {
    
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserRepository userRepository; 
    private final CourseRepository courseRepository; 
    private final LessonRepository lessonRepository; 

    @Transactional
    public UserLessonProgressDto recordProgress(Long userId, UserLessonProgressCreationDto creationDto) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika z ID: " + userId));
        
        Course course = courseRepository.findById(creationDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kursu z ID: " + creationDto.getCourseId()));
        
        Lesson lesson = lessonRepository.findById(creationDto.getLessonId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono lekcji z ID: " + creationDto.getLessonId()));

        Optional<UserLessonProgress> existingProgress = userLessonProgressRepository
                .findByUserIdAndLessonId(userId, creationDto.getLessonId());

        UserLessonProgress progress;
        
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            
            boolean shouldUpdate = false;
            
            if (creationDto.getPointsEarned() > progress.getPointsEarned()) {
                progress.setPointsEarned(creationDto.getPointsEarned());
                shouldUpdate = true;
            }
            if (creationDto.getStarsEarned() > progress.getStarsEarned()) {
                progress.setStarsEarned(creationDto.getStarsEarned());
                shouldUpdate = true;
            }
            if (progress.getTimeTakenSeconds() == null || creationDto.getTimeTakenSeconds() < progress.getTimeTakenSeconds()) {
                progress.setTimeTakenSeconds(creationDto.getTimeTakenSeconds());
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                progress.setLastUpdated(OffsetDateTime.now());
            }
            
        } else {
            progress = new UserLessonProgress();
            progress.setUser(user); 
            progress.setCourse(course); 
            progress.setLesson(lesson);
            progress.setStarsEarned(creationDto.getStarsEarned());
            progress.setTimeTakenSeconds(creationDto.getTimeTakenSeconds());
            progress.setPointsEarned(creationDto.getPointsEarned());
            progress.setDateCreated(OffsetDateTime.now());
            progress.setLastUpdated(OffsetDateTime.now());
        }
        
        UserLessonProgress savedProgress = userLessonProgressRepository.save(progress);
        
        return mapToDto(savedProgress);
    }

    public Optional<UserLessonProgressDto> getLessonProgress(Long userId, Long lessonId) {
        return userLessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(this::mapToDto);
    }
    
    private UserLessonProgressDto mapToDto(UserLessonProgress progress) {
        UserLessonProgressDto dto = new UserLessonProgressDto();
        dto.setId(progress.getId());
        dto.setUserId(progress.getUser().getId());
        dto.setCourseId(progress.getCourse().getId());
        dto.setLessonId(progress.getLesson().getId());
        dto.setStarsEarned(progress.getStarsEarned());
        dto.setTimeTakenSeconds(progress.getTimeTakenSeconds());
        dto.setPointsEarned(progress.getPointsEarned());
        dto.setDateCreated(progress.getDateCreated());
        dto.setLastUpdated(progress.getLastUpdated());
        return dto;
    }
}