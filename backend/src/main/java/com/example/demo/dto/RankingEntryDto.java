package com.example.demo.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RankingEntryDto {
    Long userId;
    String userLogin;
    int points;
    int rank;
}