package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    /**
     * Fetches all courses with the authenticated user's current progress.
     * Maps to the /api/courses/with-progress endpoint.
     */
    @GetMapping("/with-progress")
    public ResponseEntity<List<CourseWithProgressDto>> getAllCoursesWithProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.parseLong(userDetails.getUsername());
        
        List<CourseWithProgressDto> coursesWithProgress = 
            courseService.getAllCoursesWithProgressForUser(userId);
        
        return ResponseEntity.ok(coursesWithProgress);
    }

    @GetMapping("/completed-levels/{id}")
    public ResponseEntity<Integer> getCompletedLevelsForCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.parseLong(userDetails.getUsername());
        
        int completedLevels = courseService.getCompletedLevelsForCourse(userId, id);
        
        return ResponseEntity.ok(completedLevels);
    }
}