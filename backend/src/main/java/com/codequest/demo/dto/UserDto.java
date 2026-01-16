package com.codequest.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String login;
    private String role;
    private int coins;
    private int points;
    private int rank;
    private int hearts;
    private LocalDateTime lastHeartRecovery;
    private Boolean isBlocked;
}
