package com.codequest.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.model.UserLessonProgress;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    
    Optional<UserLessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    void deleteByLessonId(Long lessonId);
    void deleteByCourseId(Long courseId);
}