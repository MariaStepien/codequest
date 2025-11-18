package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Base interface for all Lesson tasks, enabling polymorphic deserialization.
 * The @JsonTypeInfo and @JsonSubTypes annotations tell Jackson how to
 * determine the concrete class (e.g., MatchingPairsTaskDto) from the 'type'
 * field in the incoming JSON.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME, 
    include = JsonTypeInfo.As.EXISTING_PROPERTY, 
    property = "type", 
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = MatchingPairsTaskDto.class, name = "MatchingPairs"),
    @JsonSubTypes.Type(value = MultipleChoiceTaskDto.class, name = "MultipleChoice"),
    @JsonSubTypes.Type(value = FillInTheBlankTaskDto.class, name = "FillInTheBlank"),
    @JsonSubTypes.Type(value = OrderableListTaskDto.class, name = "OrderableList"),
    @JsonSubTypes.Type(value = TextBoxTaskDto.class, name = "TextBox")
})
public interface TaskDto {
    String getId();
    String getType();
    void setId(String id);
    void setType(String type);
}