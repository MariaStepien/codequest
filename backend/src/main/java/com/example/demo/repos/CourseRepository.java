package com.example.demo.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.Course;


@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List <Course> findByIsPublishedTrue();

    List<Course> findByIsPublishedFalse();
}
