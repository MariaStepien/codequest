package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.LessonCreationDto;
import com.example.demo.dto.LessonDto;
import com.example.demo.service.LessonService;

import lombok.RequiredArgsConstructor;

/**
 * REST Controller for accessing lesson data.
 */
@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonDto> getLessonDetails(@PathVariable Long lessonId) {
        
        return lessonService.getLessonWithTasks(lessonId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}/next-order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> getNextOrderIndex(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getNextOrderIndex(courseId));
    }

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDto> createLesson(
            @RequestPart("lesson") LessonCreationDto creationDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            LessonDto createdLesson = lessonService.createLesson(creationDto, file);
            return new ResponseEntity<>(createdLesson, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); 
        }
    }
    
    //gives back Lesson with specific courseId and orderIndex
    @GetMapping("/course/{courseId}/order/{orderIndex}")
    public ResponseEntity<LessonDto> getLessonDetailsByCourseAndOrder(
            @PathVariable Long courseId,
            @PathVariable Integer orderIndex) {
        
        return lessonService.getLessonWithTasksByCourseIdAndOrderIndex(courseId, orderIndex)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LessonDto>> getLessonsByCourseId(@PathVariable Long courseId) {
        List<LessonDto> lessons = lessonService.getLessonsByCourseId(courseId);
        return ResponseEntity.ok(lessons);
    }

    @PutMapping(value = "/{lessonId}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDto> updateLesson(
            @PathVariable Long lessonId, 
            @RequestPart("lesson") LessonCreationDto updateDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            LessonDto updatedLesson = lessonService.updateLesson(lessonId, updateDto, file);
            return ResponseEntity.ok(updatedLesson);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
}