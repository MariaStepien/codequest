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

    /**
     * Gets lesson with its tasks by lesson id
     * @param lessonId id of the lesson
     * @return optional containing lesson DTO with tasks
     * @throws IllegalArgumentException if no lessonId was given
     */
    public Optional<LessonDto> getLessonWithTasks(Long lessonId) {
        if (lessonId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);

        if (lessonOptional.isEmpty()) {
            return Optional.empty();
        }

        return lessonOptional.map(this::mapToDtoWithTasks);
    }
    
    /**
     * Finds lesson with tasks by course id and its order index
     * @param courseId id of the course
     * @param orderIndex number of the lesson in the course
     * @return optional containing lesson DTO with tasks
     */
    public Optional<LessonDto> getLessonWithTasksByCourseIdAndOrderIndex(Long courseId, Integer orderIndex) {
        Optional<Lesson> lessonOptional = lessonRepository.findByCourseIdAndOrderIndex(courseId, orderIndex);

        if (lessonOptional.isEmpty()) {
            return Optional.empty();
        }

        return lessonOptional.map(this::mapToDtoWithTasks);
    }

    /**
     * Determines the next available order index for a lesson within a course
     * @param courseId id of the course
     * @return next order index
     */
    public Integer getNextOrderIndex(Long courseId) {
        return lessonRepository.findTopByCourseIdOrderByOrderIndexDesc(courseId)
                .map(lesson -> lesson.getOrderIndex() + 1)
                .orElse(1);
    }

    /**
     * Creates a new lesson
     * @param creationDto data for creating the lesson
     * @param file background image file
     * @return created lesson DTO
     * @throws IOException if file saving fails
     * @throws RuntimeException if course or enemy is not found
     * @throws IllegalArgumentException if JSON tasks structure is invalid
     */
    public LessonDto createLesson(LessonCreationDto creationDto, MultipartFile file) throws IOException {
        Lesson lesson = new Lesson();

        Course course = courseRepository.findById(creationDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kursu z ID: " + creationDto.getCourseId()));
        lesson.setCourse(course);

        lesson.setTitle(creationDto.getTitle());
        lesson.setOrderIndex(creationDto.getOrderIndex());
        lesson.setHasEnemy(creationDto.isHasEnemy());
        
        if (creationDto.isHasEnemy() && creationDto.getEnemyId() != null) {
            Enemy enemy = enemyRepository.findById(creationDto.getEnemyId())
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono wroga z ID: " + creationDto.getEnemyId()));
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

    /**
     * Gets all lessons belonging to a specific course
     * @param courseId id of the course
     * @return list of simple lesson DTOs
     */
    public List<LessonDto> getLessonsByCourseId(Long courseId) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndex(courseId);

        return lessons.stream()
                .map(this::mapToSimpleDto)
                .collect(Collectors.toList());
    }

    /**
     * Deletes a lesson and its progress records
     * @param lessonId id of the lesson to be deleted
     * @throws IllegalArgumentException if no lessonId was given
     * @throws RuntimeException if lesson was not found
     */
    @Transactional
    public void deleteLesson(Long lessonId) {
        userLessonProgressRepository.deleteByLessonId(lessonId);
        if (lessonId == null) {
            throw new IllegalArgumentException("Brak ID lekcji.");
        }
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono lekcji z ID: " + lessonId));
        
        lessonRepository.delete(lesson);
    }

    /**
     * Updates an existing lesson
     * @param lessonId id of lesson to be updated
     * @param updateDto updated lesson data
     * @param file new background image file
     * @return updated lesson DTO
     * @throws IOException if file saving fails
     * @throws IllegalArgumentException if no lessonId was given or JSON is invalid
     * @throws RuntimeException if lesson, enemy, or course was not found
     */
    @Transactional
    public LessonDto updateLesson(Long lessonId, LessonCreationDto updateDto, MultipartFile file) throws IOException{
        if (lessonId == null) {
            throw new IllegalArgumentException("Brak ID lekcji.");
        }
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Nie znaleziono lekcji z ID: " + lessonId));

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
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono przeciwnika z ID: " + updateDto.getEnemyId()));
            lesson.setEnemy(enemy);
        } else {
            lesson.setEnemy(null);
        }
        
        if (updateDto.getCourseId() != null) {
             Course course = courseRepository.findById(updateDto.getCourseId())
                     .orElseThrow(() -> new RuntimeException("Nie znaleziono kursu."));
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
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid tasks JSON: " + e.getMessage());
        }
        
        lesson.setTasksJson(updateDto.getTasksJson());
        
        Lesson savedLesson = lessonRepository.save(lesson);
        
        return mapToDtoWithTasks(savedLesson); 
    }

    /**
     * Maps lesson entity to a simple DTO without tasks
     * @param lesson lesson entity
     * @return simple lesson DTO
     */
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

    /**
     * Maps lesson entity to a DTO including parsed tasks from JSON
     * @param lesson lesson entity
     * @return lesson DTO with tasks
     */
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
            
        } catch (IOException e) {
            lessonDto.setTasks(List.of());
        }

        return lessonDto;
    }

    /**
     * Saves an uploaded file to the local storage
     * @param file multipart file to be saved
     * @return path to the saved file
     * @throws IOException if file creation or copying fails
     */
    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String fileName = file.getOriginalFilename();
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return UPLOAD_DIR + "/" + fileName;
    }
}