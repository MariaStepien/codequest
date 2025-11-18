package com.example.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class MultipleChoiceTaskDto implements TaskDto {

    private String id;
    private String type = "MultipleChoice"; // Must match the name in @JsonSubTypes
    private String question;
    private List<String> options;
    private String correctAnswer;
}