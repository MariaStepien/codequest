package com.example.demo.dto;

import java.time.OffsetDateTime;

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
    private OffsetDateTime dateCreated;
    private OffsetDateTime lastUpdated;
}