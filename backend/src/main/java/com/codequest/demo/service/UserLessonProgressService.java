package com.codequest.demo.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.dto.UserLessonProgressCreationDto;
import com.codequest.demo.dto.UserLessonProgressDto;
import com.codequest.demo.model.Course;
import com.codequest.demo.model.Lesson;
import com.codequest.demo.model.User;
import com.codequest.demo.model.UserLessonProgress;
import com.codequest.demo.repository.CourseRepository;
import com.codequest.demo.repository.LessonRepository;
import com.codequest.demo.repository.UserLessonProgressRepository;
import com.codequest.demo.repository.UserRepository;

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
    public UserLessonProgressDto recordProgress(Long userId, UserLessonProgressCreationDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika: " + userId));
        
        Course course = courseRepository.getReferenceById(dto.getCourseId());
        Lesson lesson = lessonRepository.getReferenceById(dto.getLessonId());

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(userId, dto.getLessonId())
                .orElseGet(() -> {
                    UserLessonProgress newProgress = new UserLessonProgress();
                    newProgress.setUser(user);
                    newProgress.setCourse(course);
                    newProgress.setLesson(lesson);
                    newProgress.setPointsEarned(0);
                    newProgress.setStarsEarned(0);
                    return newProgress;
                });

        updateStatsAndRewards(user, progress, dto);

        UserLessonProgress savedProgress = userLessonProgressRepository.save(progress);
        
        return mapToDto(savedProgress);
    }

    private void updateStatsAndRewards(User user, UserLessonProgress progress, UserLessonProgressCreationDto dto) {
        if (dto.getPointsEarned() > progress.getPointsEarned()) {
            int diff = dto.getPointsEarned() - progress.getPointsEarned();
            user.setPoints(user.getPoints() + diff);
            progress.setPointsEarned(dto.getPointsEarned());
        }

        if (dto.getStarsEarned() > progress.getStarsEarned()) {
            int coinsToAward = getCoinsForStars(dto.getStarsEarned()) - getCoinsForStars(progress.getStarsEarned());
            user.setCoins(user.getCoins() + coinsToAward);
            progress.setStarsEarned(dto.getStarsEarned());
        }

        if (progress.getTimeTakenSeconds() == null || dto.getTimeTakenSeconds() < progress.getTimeTakenSeconds()) {
            progress.setTimeTakenSeconds(dto.getTimeTakenSeconds());
        }
    }

    private int getCoinsForStars(int stars) {
        int index = Math.min(stars, STAR_COIN_REWARDS.length - 1);
        return STAR_COIN_REWARDS[index];
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