package com.codequest.demo.dto;

import lombok.Data;

@Data
public class TextBoxTaskDto implements TaskDto {

    private String id;
    private String type = "TextBox"; // Must match the name in @JsonSubTypes
    private String sentence;
    private String bgColor;
    private String borderColor;
}