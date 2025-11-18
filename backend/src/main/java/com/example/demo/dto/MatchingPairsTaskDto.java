package com.example.demo.dto;

import lombok.Data;

import java.util.List;

@Data // Lombok annotation for getters, setters, toString, etc.
public class MatchingPairsTaskDto implements TaskDto {

    private String id;
    private String type = "MatchingPairs"; // Must match the name in @JsonSubTypes
    private String prompt;
    
    // Inner class for the items structure
    @Data
    public static class PairItem {
        private String key;
        private String left;
        private String right;
    }
    
    private List<PairItem> items;
}