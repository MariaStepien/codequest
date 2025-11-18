package com.example.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.domain.UserCourseProgress;

@Repository
public interface  UserCourseProgressRepository extends JpaRepository<UserCourseProgress, Long> {
    
}
