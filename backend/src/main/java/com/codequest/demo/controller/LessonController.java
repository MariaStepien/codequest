package com.codequest.demo.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codequest.demo.dto.LessonCreationDto;
import com.codequest.demo.dto.LessonDto;
import com.codequest.demo.service.LessonService;

import lombok.RequiredArgsConstructor;

/**
 * REST Controller for accessing lesson data.
 */
@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    /**
     * Fetches lesson details for a given lesson Id.
     * Maps to the /api/lessons/{lessonId} endpoint.
     */
    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonDto> getLessonDetails(@PathVariable Long lessonId) {
        
        return lessonService.getLessonWithTasks(lessonId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Fetches the next available order index for a lesson in a given course.
     * Maps to the /api/lessons/course/{courseId}/next-order endpoint.
     */
    @GetMapping("/course/{courseId}/next-order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> getNextOrderIndex(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getNextOrderIndex(courseId));
    }

    /**
     * Creates a new lesson with optional file attachment.
     * Maps to the /api/lessons/create endpoint.
     */
    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDto> createLesson(
            @RequestPart("lesson") LessonCreationDto creationDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            LessonDto createdLesson = lessonService.createLesson(creationDto, file);
            return new ResponseEntity<>(createdLesson, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build(); 
        }
    }

    /**
     * Deletes a specific lesson.
     * Maps to the /api/lessons/{lessonId} endpoint.
     */
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        try {
            lessonService.deleteLesson(lessonId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Fetches lesson details for a specific course and order index.
     * Maps to the /api/lessons/course/{courseId}/order/{orderIndex} endpoint.
     */
    @GetMapping("/course/{courseId}/order/{orderIndex}")
    public ResponseEntity<LessonDto> getLessonDetailsByCourseAndOrder(
            @PathVariable Long courseId,
            @PathVariable Integer orderIndex) {
        
        return lessonService.getLessonWithTasksByCourseIdAndOrderIndex(courseId, orderIndex)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Fetches all lessons associated with a specific course.
     * Maps to the /api/lessons/course/{courseId} endpoint.
     */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LessonDto>> getLessonsByCourseId(@PathVariable Long courseId) {
        List<LessonDto> lessons = lessonService.getLessonsByCourseId(courseId);
        return ResponseEntity.ok(lessons);
    }

    /**
     * Updates an existing lesson's details and/or attached file.
     * Maps to the /api/lessons/{lessonId} endpoint.
     */
    @PutMapping(value = "/{lessonId}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDto> updateLesson(
            @PathVariable Long lessonId, 
            @RequestPart("lesson") LessonCreationDto updateDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            LessonDto updatedLesson = lessonService.updateLesson(lessonId, updateDto, file);
            return ResponseEntity.ok(updatedLesson);
        } catch (IOException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
}