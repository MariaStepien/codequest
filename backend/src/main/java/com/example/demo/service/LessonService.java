package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Lesson;
import com.example.demo.dto.LessonCreationDto;
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

        return lessonOptional.map(this::mapToDtoWithTasks);
    }
    
    /**
     * Retrieves a lesson by Course ID and Order Index, including the parsed list of tasks.
     * This is the new method to support level map clicks.
     * @param courseId The ID of the course.
     * @param orderIndex The sequential order of the lesson.
     * @return An Optional containing the fully processed LessonDto, or empty if not found.
     */
    public Optional<LessonDto> getLessonWithTasksByCourseIdAndOrderIndex(Long courseId, Integer orderIndex) {
        
        Optional<Lesson> lessonOptional = lessonRepository.findByCourseIdAndOrderIndex(courseId, orderIndex);

        if (lessonOptional.isEmpty()) {
            return Optional.empty();
        }

        return lessonOptional.map(this::mapToDtoWithTasks);
    }

    public LessonDto createLesson(LessonCreationDto creationDto) {
        Lesson lesson = new Lesson();
        lesson.setCourseId(creationDto.getCourseId());
        lesson.setTitle(creationDto.getTitle());
        lesson.setOrderIndex(creationDto.getOrderIndex());
        
        try {
            JsonNode rootNode = objectMapper.readTree(creationDto.getTasksJson());
            JsonNode tasksNode = rootNode.get("tasks");
            
            if (tasksNode == null || !tasksNode.isArray()) {
                 throw new IllegalArgumentException("Tasks JSON must contain a root 'tasks' array.");
            }
            objectMapper.readValue(tasksNode.traverse(), new TypeReference<List<TaskDto>>() {});
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid tasks JSON provided: " + e.getMessage());
        }
        
        lesson.setTasksJson(creationDto.getTasksJson());
        
        Lesson savedLesson = lessonRepository.save(lesson);
        
        return mapToDtoWithTasks(savedLesson); 
    }

    
    private LessonDto mapToDtoWithTasks(Lesson lesson) {
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
                System.err.println("Błąd przetwarzania zadań z JSON dla lekcji o ID " + lesson.getId() + ": 'tasks' jest brakujące lub struktura JSON jest niepoprawna.");
                lessonDto.setTasks(List.of()); 
            }
            
        } catch (Exception e) {
            System.err.println("Błąd przetwarzania zadań z JSON dla lekcji o ID " + lesson.getId() + ": " + e.getMessage());
            lessonDto.setTasks(List.of());
        }

        return lessonDto;
    }
}