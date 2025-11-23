package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Course;
import com.example.demo.dto.CourseDTO;
import com.example.demo.dto.CourseWithProgressDto;
import com.example.demo.repos.CourseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseProgressService progressService;

    public List<CourseDTO> findAllCourses() {
        List<Course> courses = courseRepository.findAll();
        
        return courses.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public Optional<CourseDTO> findCourseDetailsById(Long id) {
        return courseRepository.findById(id)
            .map(this::mapToDTO);
    }

    private CourseDTO mapToDTO(Course course) {
        return new CourseDTO(
            course.getId(),
            course.getTitle(),
            course.getTotalLessons(),
            course.getEstimatedHours()
        );
    }

    public List<CourseWithProgressDto> getAllCoursesWithProgressForUser(Long userId) {
        List<Course> courses = courseRepository.findAll();

        return courses.stream().map(course -> {
            CourseWithProgressDto dto = CourseWithProgressDto.fromCourse(course);

            int completedLevels = progressService.getCompletedLevelsForCourse(userId, course.getId());
            
            dto.setCompletedLevels(completedLevels);

            return dto;
        }).collect(Collectors.toList());
    }
}