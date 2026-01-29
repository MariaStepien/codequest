package com.codequest.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.dto.CourseDTO;
import com.codequest.demo.dto.CourseWithProgressDto;
import com.codequest.demo.model.Course;
import com.codequest.demo.repository.CourseRepository;
import com.codequest.demo.repository.LessonRepository;
import com.codequest.demo.repository.UserCourseProgressRepository;
import com.codequest.demo.repository.UserLessonProgressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseProgressRepository userCourseProgressRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final LessonRepository lessonRepository;
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
        if (courseRepository.existsByTitle(courseDTO.getTitle())) {
            throw new RuntimeException("Kurs o takim tytule już istnieje.");
        }
        Course course = new Course();
        course.setTitle(courseDTO.getTitle());
        course.setTotalLessons(courseDTO.getTotalLessons());
        course.setEstimatedHours(courseDTO.getEstimatedHours());
        course.setTrophyImgSource(courseDTO.getTrophyImgSource());
        course.setIsPublished(false);

        Course savedCourse = courseRepository.save(course);

        return mapToDTO(savedCourse);
    }

    @Transactional
    public Optional<CourseDTO> updateCourse(Long id, CourseDTO courseDTO) {
        return courseRepository.findById(id).map(existingCourse -> {

            if (courseRepository.existsByTitleAndIdNot(courseDTO.getTitle(), id)) {
                throw new RuntimeException("Inny kurs posiada już taki tytuł.");
            }
            
            existingCourse.setTitle(courseDTO.getTitle());
            existingCourse.setTotalLessons(courseDTO.getTotalLessons());
            existingCourse.setEstimatedHours(courseDTO.getEstimatedHours());
            existingCourse.setTrophyImgSource(courseDTO.getTrophyImgSource());
            
            if (courseDTO.getIsPublished() != null) {
                existingCourse.setIsPublished(courseDTO.getIsPublished());
            }
            Course updatedCourse = courseRepository.save(existingCourse);
            
            return mapToDTO(updatedCourse);
        });
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (Boolean.TRUE.equals(course.getIsPublished())) {
            throw new IllegalStateException("Cannot delete a published course. Unpublish it first.");
        }

        userCourseProgressRepository.deleteByCourseId(courseId);
        userLessonProgressRepository.deleteByCourseId(courseId);
        lessonRepository.deleteByCourseId(courseId);

        if (course.getTrophyImgSource() != null) {
            try {
                Path path = Paths.get("uploads").resolve(course.getTrophyImgSource());
                Files.deleteIfExists(path);
            } catch (IOException e) {
                System.err.println("Could not delete trophy file: " + e.getMessage());
            }
        }

        courseRepository.delete(course);
    }

    private CourseDTO mapToDTO(Course course) {
        return new CourseDTO(
            course.getId(),
            course.getTitle(),
            course.getTotalLessons(),
            course.getEstimatedHours(),
            course.getIsPublished(),
            course.getTrophyImgSource()
        );
    }

    public List<CourseWithProgressDto> getAllCoursesWithProgressForUser(Long userId) {
        List<Course> courses = courseRepository.findByIsPublishedTrue();

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