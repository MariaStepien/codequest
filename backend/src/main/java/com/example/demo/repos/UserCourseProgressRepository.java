package com.example.demo.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.UserCourseProgress;

@Repository
public interface  UserCourseProgressRepository extends JpaRepository<UserCourseProgress, Long> {

    Optional<UserCourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);
    // Custom query to find the single progress record for a user
    // ordered by the most recent lastUpdated date
    @Query("SELECT p FROM UserCourseProgress p WHERE p.user.id = :userId ORDER BY p.lastUpdated DESC LIMIT 1")
    Optional<UserCourseProgress> findLatestProgressByUserId(@Param("userId") Long userId);
}

