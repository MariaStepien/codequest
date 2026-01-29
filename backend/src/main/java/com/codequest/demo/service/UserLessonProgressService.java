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

    /**
     * Records or updates progress for a specific lesson, awarding coins for stars
     * @param userId id of the user
     * @param dto progress data to be recorded
     * @return DTO of the recorded progress
     * @throws RuntimeException if user, course, or lesson is not found
     */
   @Transactional
    public UserLessonProgressDto recordProgress(Long userId, UserLessonProgressCreationDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kursu"));
        Lesson lesson = lessonRepository.findById(dto.getLessonId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono lekcji"));

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(userId, dto.getLessonId())
                .orElseGet(() -> {
                    UserLessonProgress newProgress = new UserLessonProgress();
                    newProgress.setUser(user);
                    newProgress.setCourse(course);
                    newProgress.setLesson(lesson);
                    newProgress.setStarsEarned(0); 
                    return newProgress;
                });

        updateProgressFields(progress, dto, user);

        UserLessonProgress saved = userLessonProgressRepository.save(progress);
        return mapToDto(saved);
    }

    /**
     * Updates progress fields and handles coin rewards logic
     * @param progress existing or new progress entity
     * @param dto new progress data
     * @param user user entity to receive coins
     */
    private void updateProgressFields(UserLessonProgress progress, UserLessonProgressCreationDto dto, User user) {
        if (dto.getPointsEarned() > progress.getPointsEarned()) {
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

    /**
     * Maps star count to coin reward based on internal reward table
     * @param stars number of stars earned
     * @return amount of coins to award
     */
    private int getCoinsForStars(int stars) {
        int index = Math.min(stars, STAR_COIN_REWARDS.length - 1);
        return STAR_COIN_REWARDS[index];
    }

    /**
     * Gets progress for a specific lesson and user
     * @param userId id of the user
     * @param lessonId id of the lesson
     * @return optional containing the lesson progress DTO
     */
    public Optional<UserLessonProgressDto> getLessonProgress(Long userId, Long lessonId) {
        return userLessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(this::mapToDto);
    }
    
    /**
     * Maps progress entity to its DTO
     * @param progress progress entity
     * @return progress DTO
     */
    private UserLessonProgressDto mapToDto(UserLessonProgress progress) {
        UserLessonProgressDto dto = new UserLessonProgressDto();
        dto.setId(progress.getId());
        dto.setUserId(progress.getUser().getId());
        dto.setCourseId(progress.getCourse().getId());
        dto.setLessonId(progress.getLesson().getId());
        dto.setStarsEarned(progress.getStarsEarned());
        dto.setTimeTakenSeconds(progress.getTimeTakenSeconds());
        dto.setPointsEarned(progress.getPointsEarned());
        return dto;
    }
}