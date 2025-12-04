package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CourseDTO;
import com.example.demo.dto.CourseWithProgressDto;
import com.example.demo.service.CourseService;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> courses = courseService.findAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseDetails(@PathVariable Long id) {
        return courseService.findCourseDetailsById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create-course")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        CourseDTO createdCourse = courseService.createCourse(courseDTO);
        return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO) {
        courseDTO.setId(id);
        return courseService.updateCourse(id, courseDTO)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Fetches all courses with the authenticated user's current progress.
     * Maps to the /api/courses/with-progress endpoint.
     */
    @GetMapping("/with-progress")
    public ResponseEntity<List<CourseWithProgressDto>> getAllCoursesWithProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        
        List<CourseWithProgressDto> coursesWithProgress = 
            courseService.getAllCoursesWithProgressForUser(userId);
        
        return ResponseEntity.ok(coursesWithProgress);
    }

    @GetMapping("/completed-levels/{id}")
    public ResponseEntity<Integer> getCompletedLevelsForCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        
        int completedLevels = courseService.getCompletedLevelsForCourse(userId, id);
        
        return ResponseEntity.ok(completedLevels);
    }

    @GetMapping("/published")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseDTO>> getAllPublishedCourses() {
        List<CourseDTO> courses = courseService.findAllPublishedCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/unpublished")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseDTO>> getAllUnpublishedCourses() {
        List<CourseDTO> courses = courseService.findAllUnpublishedCourses();
        return ResponseEntity.ok(courses);
    }
    
}