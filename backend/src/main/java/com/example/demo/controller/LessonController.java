package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    
    //gives back Lesson with specific courseId and orderIndex
    @GetMapping("/course/{courseId}/order/{orderIndex}")
    public ResponseEntity<LessonDto> getLessonDetailsByCourseAndOrder(
            @PathVariable Long courseId,
            @PathVariable Integer orderIndex) {
        
        return lessonService.getLessonWithTasksByCourseIdAndOrderIndex(courseId, orderIndex)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}