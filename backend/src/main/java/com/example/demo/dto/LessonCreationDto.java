package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonCreationDto {

    @NotNull(message = "Course ID cannot be null")
    private Long courseId;
    
    @NotBlank(message = "Title cannot be empty")
    private String title;
    
    @NotNull(message = "Order Index cannot be null")
    private Integer orderIndex;
    
    @NotBlank(message = "Tasks JSON cannot be empty")
    private String tasksJson;
    
    private boolean hasEnemy;

    private Long enemyId;
}