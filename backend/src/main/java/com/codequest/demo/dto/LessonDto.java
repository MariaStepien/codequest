package com.codequest.demo.dto;
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
    private Long courseId;
    private List<TaskDto> tasks;
    private boolean hasEnemy;
    private Long enemyId;
    private String backgroundImage;
}
