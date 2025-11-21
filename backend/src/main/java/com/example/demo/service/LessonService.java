package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Lesson;
import com.example.demo.dto.LessonDto;
import com.example.demo.dto.TaskDto;
import com.example.demo.repos.LessonRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

/**
 * Service to fetch Lesson data and parse the JSON task structure.
 */
@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ObjectMapper objectMapper; 

    /**
     * Retrieves a lesson by ID, including the parsed list of tasks.
     * @param lessonId The ID of the lesson to retrieve.
     * @return An Optional containing the fully processed LessonDto, or empty if not found.
     */
    public Optional<LessonDto> getLessonWithTasks(Long lessonId) {
        
        Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);

        if (lessonOptional.isEmpty()) {
            return Optional.empty();
        }

        Lesson lesson = lessonOptional.get();
        
        LessonDto lessonDto = new LessonDto();
        lessonDto.setId(lesson.getId());
        lessonDto.setTitle(lesson.getTitle());
        lessonDto.setOrderIndex(lesson.getOrderIndex()); 
        
        try {
            JsonNode rootNode = objectMapper.readTree(lesson.getTasksJson());
            JsonNode tasksNode = rootNode.get("tasks");
            
            if (tasksNode != null && tasksNode.isArray()) {
                TypeReference<List<TaskDto>> typeRef = new TypeReference<>() {};
                List<TaskDto> tasks = objectMapper.readValue(tasksNode.traverse(), typeRef);
                
                lessonDto.setTasks(tasks);
            } else {
                System.err.println("Error parsing tasks JSON for lesson ID " + lessonId + ": 'tasks' array field is missing or invalid in JSON structure.");
                lessonDto.setTasks(List.of()); 
            }
            // 🌟🌟🌟 FIX END 🌟🌟🌟
            
        } catch (Exception e) {
            System.err.println("Error parsing tasks JSON for lesson ID " + lessonId + ": " + e.getMessage());
            lessonDto.setTasks(List.of());
        }

        return Optional.of(lessonDto);
    }
}