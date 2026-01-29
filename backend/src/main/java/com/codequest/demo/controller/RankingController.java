package com.codequest.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.dto.RankingEntryDto;
import com.codequest.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final UserService userService;

    /**
     * Fetches the global ranking of all users.
     * Maps to the /api/ranking/global endpoint.
     */
    @GetMapping("/global")
    public ResponseEntity<List<RankingEntryDto>> getGlobalRanking() {
        List<RankingEntryDto> ranking = userService.getGlobalRanking();
        return ResponseEntity.ok(ranking);
    }
    
    /**
     * Fetches the ranking entry for the currently authenticated user.
     * Maps to the /api/ranking/me endpoint.
     */
    @GetMapping("/me")
    public ResponseEntity<RankingEntryDto> getUserRankingEntry(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); 
        }

        try {
            Long userId = Long.valueOf(userDetails.getUsername());
            RankingEntryDto userEntry = userService.getUserRankEntry(userId);
            return ResponseEntity.ok(userEntry);
        } catch (NumberFormatException e) {
            return ResponseEntity.notFound().build();
        }
    }
}