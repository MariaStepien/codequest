package com.example.demo.dto;

import lombok.Data;

@Data
public class UserLessonProgressCreationDto {
    
    private Long lessonId;
    private Long courseId;
    private Integer starsEarned; // Ilość otrzymanych gwiazd
    private Integer timeTakenSeconds; // Czas potrzebny do przejścia w sekundach
    private Integer pointsEarned; // Ilość otrzymanych punktów za poziom
}