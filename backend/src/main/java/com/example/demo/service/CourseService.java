package com.example.demo.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public CourseDTO createCourse(CourseDTO courseDTO) {
        Course course = new Course();
        course.setTitle(courseDTO.getTitle());
        course.setTotalLessons(courseDTO.getTotalLessons());
        course.setEstimatedHours(courseDTO.getEstimatedHours());
        course.setDateCreated(OffsetDateTime.now());
        course.setLastUpdated(OffsetDateTime.now());
        course.setIsPublished(false);

        Course savedCourse = courseRepository.save(course);

        return mapToDTO(savedCourse);
    }

    @Transactional
    public Optional<CourseDTO> updateCourse(Long id, CourseDTO courseDTO) {
        return courseRepository.findById(id).map(existingCourse -> {
            
            existingCourse.setTitle(courseDTO.getTitle());
            existingCourse.setTotalLessons(courseDTO.getTotalLessons());
            existingCourse.setEstimatedHours(courseDTO.getEstimatedHours());
            
            if (courseDTO.getIsPublished() != null) {
                existingCourse.setIsPublished(courseDTO.getIsPublished());
            }
            
            existingCourse.setLastUpdated(OffsetDateTime.now()); 
            Course updatedCourse = courseRepository.save(existingCourse);
            
            return mapToDTO(updatedCourse);
        });
    }

    private CourseDTO mapToDTO(Course course) {
        return new CourseDTO(
            course.getId(),
            course.getTitle(),
            course.getTotalLessons(),
            course.getEstimatedHours(),
            course.getIsPublished()
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

    public int getCompletedLevelsForCourse(Long userId, Long courseId) {
        return progressService.getCompletedLevelsForCourse(userId, courseId);
    }

    public List<CourseDTO> findAllPublishedCourses() {
        List<Course> courses = courseRepository.findByIsPublishedTrue();
        
        return courses.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<CourseDTO> findAllUnpublishedCourses() {
        List<Course> courses = courseRepository.findByIsPublishedFalse();
        
        return courses.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
}