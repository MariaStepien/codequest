package com.codequest.demo.service;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.domain.Course;
import com.codequest.demo.domain.Lesson;
import com.codequest.demo.domain.User; 
import com.codequest.demo.domain.UserLessonProgress;
import com.codequest.demo.dto.UserLessonProgressCreationDto;
import com.codequest.demo.dto.UserLessonProgressDto;
import com.codequest.demo.repos.CourseRepository;
import com.codequest.demo.repos.LessonRepository;
import com.codequest.demo.repos.UserLessonProgressRepository;
import com.codequest.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserLessonProgressService {
    
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserRepository userRepository; 
    private final CourseRepository courseRepository; 
    private final LessonRepository lessonRepository; 

    // 0 stars: 0 coins
    // 1 star: 5 coins
    // 2 stars: 10 coins
    // 3 stars: 20 coins
    private static final int[] STAR_COIN_REWARDS = {0, 5, 10, 20};

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
                
                int oldPoints = progress.getPointsEarned();
                int newPoints = creationDto.getPointsEarned();
                int pointsToAdd = newPoints - oldPoints;
                
                user.setPoints(user.getPoints() + pointsToAdd);
                userRepository.save(user); 
                
                progress.setPointsEarned(newPoints);
                shouldUpdate = true;
            }
            if (progress.getTimeTakenSeconds() == null || creationDto.getTimeTakenSeconds() < progress.getTimeTakenSeconds()) {
                progress.setTimeTakenSeconds(creationDto.getTimeTakenSeconds());
                shouldUpdate = true;
            }

            if (creationDto.getStarsEarned() > progress.getStarsEarned()) {
                
                int oldStars = progress.getStarsEarned();
                int newStars = creationDto.getStarsEarned();

                int oldMaxCoins = oldStars < STAR_COIN_REWARDS.length ? STAR_COIN_REWARDS[oldStars] : STAR_COIN_REWARDS[STAR_COIN_REWARDS.length - 1];
                int newMaxCoins = newStars < STAR_COIN_REWARDS.length ? STAR_COIN_REWARDS[newStars] : STAR_COIN_REWARDS[STAR_COIN_REWARDS.length - 1];

                int coinsToAward = newMaxCoins - oldMaxCoins;
                
                if (coinsToAward > 0) {
                     user.setCoins(user.getCoins() + coinsToAward);
                     userRepository.save(user); 
                }

                progress.setStarsEarned(newStars); 
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                progress.setLastUpdated(OffsetDateTime.now());
            }
            
        } else {
            int initialStars = creationDto.getStarsEarned();
            int initialCoins = initialStars < STAR_COIN_REWARDS.length ? STAR_COIN_REWARDS[initialStars] : STAR_COIN_REWARDS[STAR_COIN_REWARDS.length - 1];
            
            if (initialCoins > 0) {
                 user.setCoins(user.getCoins() + initialCoins);
            }
            
            if (creationDto.getPointsEarned() > 0) {
                 user.setPoints(user.getPoints() + creationDto.getPointsEarned());
            }

            userRepository.save(user); 
            
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