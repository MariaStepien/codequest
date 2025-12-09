package com.example.demo.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.UserLessonProgress;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    
    Optional<UserLessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
}