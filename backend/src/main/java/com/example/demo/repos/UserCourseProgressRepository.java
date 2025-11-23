package com.example.demo.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.domain.UserCourseProgress;

@Repository
public interface  UserCourseProgressRepository extends JpaRepository<UserCourseProgress, Long> {

    Optional<UserCourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);
    
}
