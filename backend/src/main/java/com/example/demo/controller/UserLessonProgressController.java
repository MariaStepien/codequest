package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UserLessonProgressCreationDto;
import com.example.demo.dto.UserLessonProgressDto;
import com.example.demo.service.UserLessonProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lesson-progress")
@RequiredArgsConstructor
public class UserLessonProgressController {
    
    private final UserLessonProgressService progressService;

    @PutMapping("/record")
    public ResponseEntity<UserLessonProgressDto> recordProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserLessonProgressCreationDto request) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long userId = Long.parseLong(userDetails.getUsername());
            
            UserLessonProgressDto updatedProgress = progressService.recordProgress(
                userId, 
                request
            );
            
            return ResponseEntity.ok(updatedProgress); 
        } catch (NumberFormatException e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Nie znaleziono")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            throw e; 
        }
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<UserLessonProgressDto> getLessonProgress(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = Long.parseLong(userDetails.getUsername());

        return progressService.getLessonProgress(userId, lessonId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}