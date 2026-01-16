package com.codequest.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.domain.User;
import com.codequest.demo.dto.UserDto;
import com.codequest.demo.service.UserService;

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

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/{id}/toggle-block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleBlock(@PathVariable Long id) {
        userService.toggleBlockStatus(id);
        return ResponseEntity.ok().build();
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