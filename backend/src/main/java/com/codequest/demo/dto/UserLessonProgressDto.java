package com.codequest.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserLessonProgressDto {
    
    private Long id;
    private Long courseId;
    private Long lessonId;
    private Long userId;
    private Integer starsEarned;
    private Integer timeTakenSeconds;
    private Integer pointsEarned;
    private LocalDateTime dateCreated;
    private LocalDateTime lastUpdated;
}