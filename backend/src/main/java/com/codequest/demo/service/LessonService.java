package com.codequest.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codequest.demo.dto.LessonCreationDto;
import com.codequest.demo.dto.LessonDto;
import com.codequest.demo.dto.TaskDto;
import com.codequest.demo.model.Course;
import com.codequest.demo.model.Enemy;
import com.codequest.demo.model.Lesson;
import com.codequest.demo.repository.CourseRepository;
import com.codequest.demo.repository.EnemyRepository;
import com.codequest.demo.repository.LessonRepository;
import com.codequest.demo.repository.UserLessonProgressRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final CourseRepository courseRepository;
    private final EnemyRepository enemyRepository;
    private final ObjectMapper objectMapper; 
    private final String UPLOAD_DIR = "uploads/backgrounds";

    public Optional<LessonDto> getLessonWithTasks(Long lessonId) {
        Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);

        if (lessonOptional.isEmpty()) {
            return Optional.empty();
        }

        return lessonOptional.map(this::mapToDtoWithTasks);
    }
    
    public Optional<LessonDto> getLessonWithTasksByCourseIdAndOrderIndex(Long courseId, Integer orderIndex) {
        Optional<Lesson> lessonOptional = lessonRepository.findByCourseIdAndOrderIndex(courseId, orderIndex);

        if (lessonOptional.isEmpty()) {
            return Optional.empty();
        }

        return lessonOptional.map(this::mapToDtoWithTasks);
    }

    public Integer getNextOrderIndex(Long courseId) {
        return lessonRepository.findTopByCourseIdOrderByOrderIndexDesc(courseId)
                .map(lesson -> lesson.getOrderIndex() + 1)
                .orElse(1);
    }

    public LessonDto createLesson(LessonCreationDto creationDto, MultipartFile file) throws IOException {
        Lesson lesson = new Lesson();
        
        Course course = courseRepository.findById(creationDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + creationDto.getCourseId()));
        lesson.setCourse(course);

        lesson.setTitle(creationDto.getTitle());
        lesson.setOrderIndex(creationDto.getOrderIndex());
        lesson.setHasEnemy(creationDto.isHasEnemy());
        
        if (creationDto.isHasEnemy() && creationDto.getEnemyId() != null) {
            Enemy enemy = enemyRepository.findById(creationDto.getEnemyId())
                    .orElseThrow(() -> new RuntimeException("Enemy not found with ID: " + creationDto.getEnemyId()));
            lesson.setEnemy(enemy);
        }
        
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
        
        if (file != null && !file.isEmpty()) {
            lesson.setBackgroundImage(saveFile(file));
        }
        
        Lesson savedLesson = lessonRepository.save(lesson);
        
        return mapToDtoWithTasks(savedLesson); 
    }

    public List<LessonDto> getLessonsByCourseId(Long courseId) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndex(courseId);

        return lessons.stream()
                .map(this::mapToSimpleDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        userLessonProgressRepository.deleteByLessonId(lessonId);
        
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));
        
        lessonRepository.delete(lesson);
    }

    @Transactional
    public LessonDto updateLesson(Long lessonId, LessonCreationDto updateDto, MultipartFile file) throws IOException{
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));

        Integer oldOrderIndex = lesson.getOrderIndex();
        Integer newOrderIndex = updateDto.getOrderIndex();
        Long courseId = updateDto.getCourseId() != null ? updateDto.getCourseId() : lesson.getCourse().getId();

        if (!oldOrderIndex.equals(newOrderIndex)) {
            Optional<Lesson> lessonToSwap = lessonRepository.findByCourseIdAndOrderIndex(courseId, newOrderIndex);
            
            if (lessonToSwap.isPresent()) {
                Lesson otherLesson = lessonToSwap.get();
                otherLesson.setOrderIndex(oldOrderIndex);
                lessonRepository.save(otherLesson);
            }
        }

        lesson.setTitle(updateDto.getTitle());
        lesson.setOrderIndex(newOrderIndex);
        lesson.setHasEnemy(updateDto.isHasEnemy());
        
        if (updateDto.isHasEnemy() && updateDto.getEnemyId() != null) {
            Enemy enemy = enemyRepository.findById(updateDto.getEnemyId())
                    .orElseThrow(() -> new RuntimeException("Enemy not found with ID: " + updateDto.getEnemyId()));
            lesson.setEnemy(enemy);
        } else {
            lesson.setEnemy(null);
        }
        
        if (updateDto.getCourseId() != null) {
             Course course = courseRepository.findById(updateDto.getCourseId())
                     .orElseThrow(() -> new RuntimeException("Course not found"));
             lesson.setCourse(course);
        }

        if (file != null && !file.isEmpty()) {
            lesson.setBackgroundImage(saveFile(file));
        }

        try {
            JsonNode rootNode = objectMapper.readTree(updateDto.getTasksJson());
            if (!rootNode.has("tasks") || !rootNode.get("tasks").isArray()) {
                 throw new IllegalArgumentException("Invalid tasks JSON structure: 'tasks' array missing or malformed.");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid tasks JSON: " + e.getMessage());
        }
        
        lesson.setTasksJson(updateDto.getTasksJson());
        
        Lesson savedLesson = lessonRepository.save(lesson);
        
        return mapToDtoWithTasks(savedLesson); 
    }

    private LessonDto mapToSimpleDto(Lesson lesson) {
        LessonDto lessonDto = new LessonDto();
        lessonDto.setId(lesson.getId());
        lessonDto.setTitle(lesson.getTitle());
        lessonDto.setOrderIndex(lesson.getOrderIndex());
        lessonDto.setCourseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null);
        lessonDto.setTasks(List.of()); 
        lessonDto.setHasEnemy(lesson.isHasEnemy());
        if (lesson.getEnemy() != null){
            lessonDto.setEnemyId(lesson.getEnemy().getId());
        }
        lessonDto.setBackgroundImage(lesson.getBackgroundImage());

        return lessonDto;
    }


    private LessonDto mapToDtoWithTasks(Lesson lesson) {
        LessonDto lessonDto = new LessonDto();
        lessonDto.setId(lesson.getId());
        lessonDto.setTitle(lesson.getTitle());
        lessonDto.setOrderIndex(lesson.getOrderIndex());
        lessonDto.setCourseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null);
        lessonDto.setHasEnemy(lesson.isHasEnemy());
        if (lesson.getEnemy() != null){
            lessonDto.setEnemyId(lesson.getEnemy().getId());
        }
        lessonDto.setBackgroundImage(lesson.getBackgroundImage());

        try {
            JsonNode rootNode = objectMapper.readTree(lesson.getTasksJson());
            JsonNode tasksNode = rootNode.get("tasks");
            
            if (tasksNode != null && tasksNode.isArray()) {
                TypeReference<List<TaskDto>> typeRef = new TypeReference<>() {};
                List<TaskDto> tasks = objectMapper.readValue(tasksNode.traverse(), typeRef);
                
                lessonDto.setTasks(tasks);
            } else {
                lessonDto.setTasks(List.of()); 
            }
            
        } catch (Exception e) {
            lessonDto.setTasks(List.of());
        }

        return lessonDto;
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String fileName = file.getOriginalFilename();
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return UPLOAD_DIR + "/" + fileName;
    }
}