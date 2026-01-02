package com.example.demo.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.Lesson;

/**
 * Repository interface for Lesson data access.
 * Extends JpaRepository to get standard CRUD operations automatically.
 */
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    Optional<Lesson> findByCourseIdAndOrderIndex(Long courseId, Integer orderIndex);
    List<Lesson> findByCourseIdOrderByOrderIndex(Long courseId);
    Optional<Lesson> findTopByCourseIdOrderByOrderIndexDesc(Long courseId);
    boolean existsByCourseIdAndOrderIndex(Long courseId, Integer orderIndex);
    void deleteByCourseId(Long courseId);
}
