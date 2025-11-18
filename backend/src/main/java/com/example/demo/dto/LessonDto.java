package com.example.demo.dto;
import java.util.List;

import lombok.Data;

/**
 * The final DTO sent back to the frontend, containing all parsed tasks.
 */
@Data
public class LessonDto {
    private Long id;
    private String title;
    private Integer orderIndex;
    
    // The list of parsed, strongly-typed TaskDto objects
    private List<TaskDto> tasks;
}
