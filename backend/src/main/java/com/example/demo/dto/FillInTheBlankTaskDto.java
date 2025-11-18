package com.example.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class FillInTheBlankTaskDto implements TaskDto {

    private String id;
    private String type = "FillInTheBlank"; // Must match the name in @JsonSubTypes
    private String sentence;
    private List<String> correctAnswers;
}