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

    @GetMapping("/global")
    public ResponseEntity<List<RankingEntryDto>> getGlobalRanking() {
        List<RankingEntryDto> ranking = userService.getGlobalRanking();
        return ResponseEntity.ok(ranking);
    }
    
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
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}