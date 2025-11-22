package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Course;
import com.example.demo.dto.CourseDTO;
import com.example.demo.repos.CourseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDTO> findAllCourses() {
        List<Course> courses = courseRepository.findAll();
        
        return courses.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private CourseDTO mapToDTO(Course course) {

        return new CourseDTO(
            course.getTitle(),
            course.getTotal_lessons(),
            course.getEstimated_hours()
        );
    }
}
