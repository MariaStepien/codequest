package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.User;
import com.example.demo.dto.UserDto;
import com.example.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getLoggedInUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.valueOf(userDetails.getUsername());
        User loggedInUser = userService.findUserById(userId); 
        return ResponseEntity.ok(userService.convertToDto(loggedInUser));
    }

    @PostMapping("/consume-heart")
    public ResponseEntity<Map<String, Object>> consumeHeart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.valueOf(userDetails.getUsername());
        User updatedUser = userService.consumeHeart(userId);
        
        return ResponseEntity.ok(Map.of(
            "hearts", updatedUser.getHearts(),
            "message", "Serce zostało zużyte."
        ));
    }

    @PostMapping("/buy-heart")
    public ResponseEntity<UserDto> buyHeart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.valueOf(userDetails.getUsername());
        User updatedUser = userService.buyHeart(userId);
        
        return ResponseEntity.ok(userService.convertToDto(updatedUser));
    }
}