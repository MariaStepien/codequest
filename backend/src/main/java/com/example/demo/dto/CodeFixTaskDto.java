package com.example.demo.dto;

import lombok.Data;

@Data
public class CodeFixTaskDto implements TaskDto {

    private String id;
    private String type = "CodeFix"; // Must match the name in @JsonSubTypes
    private String instructions;
    private String incorrectCode;
    private String fixedCode;
    private Integer fixLineStart;
    private Integer fixLineEnd;
}