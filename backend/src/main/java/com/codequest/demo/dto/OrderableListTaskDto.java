package com.codequest.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class OrderableListTaskDto implements TaskDto {

    private String id;
    private String type = "OrderableList"; // Must match the name in @JsonSubTypes
    private String prompt;
    
    @Data
    public static class ListItem {
        private String id;
        private String text;
    }
    
    private List<ListItem> initialItems;
    private List<ListItem> correctOrder;
}
