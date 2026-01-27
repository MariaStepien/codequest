package com.codequest.demo.dto;

import com.codequest.demo.model.Course;

import lombok.Data;

@Data
public class CourseWithProgressDto {
    private Long id;
    private String title;
    private int totalLessons;
    private int estimatedHours;
    private int completedLevels; //will be 0 if user has no record for that course 
    private String trophyImgSource;

    public static CourseWithProgressDto fromCourse(Course course) {
        CourseWithProgressDto dto = new CourseWithProgressDto();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setTotalLessons(course.getTotalLessons());
        dto.setEstimatedHours(course.getEstimatedHours());
        dto.setTrophyImgSource(course.getTrophyImgSource());
        // Default to 0, will be set by the service layer
        dto.setCompletedLevels(0); 
        return dto;
    }
}