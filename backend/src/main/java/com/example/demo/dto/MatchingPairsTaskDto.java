package com.example.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class MatchingPairsTaskDto implements TaskDto {

    private String id;
    private String type = "MatchingPairs"; // Must match the name in @JsonSubTypes
    private String prompt;
    
    @Data
    public static class PairItem {
        private String key;
        private String left;
        private String right;
    }
    
    private List<PairItem> items;
}