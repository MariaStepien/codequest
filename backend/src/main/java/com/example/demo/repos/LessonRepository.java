package com.example.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.Lesson;

/**
 * Repository interface for Lesson data access.
 * Extends JpaRepository to get standard CRUD operations automatically.
 */
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
   
}
