package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseProgressByUserDetailsDto {
    private Long userId;
    private String userLogin;
    private int completedLessons;
    private int totalLessons;
    private boolean isCourseCompleted;
}