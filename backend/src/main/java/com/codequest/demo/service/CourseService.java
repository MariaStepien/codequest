package com.codequest.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
        if (id == null) {
            throw new IllegalArgumentException("ID kursu nie może być null.");
        }
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
        if (id == null) {
            throw new IllegalArgumentException("ID kursu nie może być null.");
        }
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
            if (courseDTO.getTrophyImgSource().isEmpty()) {
                existingCourse.setTrophyImgSource(null);
            }
            Course updatedCourse = courseRepository.save(existingCourse);
            
            return mapToDTO(updatedCourse);
        });
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        if (courseId == null) {
            throw new IllegalArgumentException("ID kursu nie może być null.");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Kurs nieznaleziony."));

        if (course.getIsPublished()) {
            throw new IllegalStateException("Nie można usunąć opublikowanego kursu.");
        }

        userCourseProgressRepository.deleteByCourseId(courseId);
        userLessonProgressRepository.deleteByCourseId(courseId);
        lessonRepository.deleteByCourseId(courseId);

        if (course.getTrophyImgSource() != null) {
            try {
                Path path = Paths.get("uploads").resolve(course.getTrophyImgSource());
                Files.deleteIfExists(path);
            } catch (IOException e) {
                System.err.println("Nie mozna bylo usunac pliku trofeum: " + e.getMessage());
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
        if (userId == null) {
            throw new IllegalArgumentException("Nie uzyskano ID użytkownika.");
        }
        List<Course> courses = courseRepository.findByIsPublishedTrue();

        return courses.stream().map(course -> {
            CourseWithProgressDto dto = CourseWithProgressDto.fromCourse(course);

            int completedLevels = progressService.getCompletedLevelsForCourse(userId, course.getId());
            
            dto.setCompletedLevels(completedLevels);

            return dto;
        }).collect(Collectors.toList());
    }

    public int getCompletedLevelsForCourse(Long userId, Long courseId) {
        if (userId == null) {
            throw new IllegalArgumentException("Nie uzyskano ID użytkownika.");
        }

        if (courseId == null) {
            throw new IllegalArgumentException("ID kursu nie może być null.");
        }
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

    @Transactional
    public CourseDTO uploadCourseTrophy(Long id, MultipartFile file) {
        if (id == null) {
            throw new IllegalArgumentException("ID kursu nie może być null.");
        }
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kurs nieznaleziony."));

        try {
            String fileName = "trophy-" + id;
            Path uploadPath = Paths.get("uploads", "trophies");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, REPLACE_EXISTING);

            course.setTrophyImgSource("trophies/" + fileName);
            Course updatedCourse = courseRepository.save(course);
            
            return mapToDTO(updatedCourse);
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas zapisywania pliku trofeum: " + e.getMessage());
        }
    }
}