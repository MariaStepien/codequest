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

    /**
     * GET endpoint to retrieve a single lesson by ID, including its parsed tasks.
     * @param lessonId The ID of the lesson to retrieve.
     * @return The LessonDto with the list of TaskDto objects, or 404 NOT FOUND.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LessonDto> getLessonDetails(@PathVariable Long lessonId) {
        
        return lessonService.getLessonWithTasks(lessonId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}