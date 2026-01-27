package com.codequest.demo.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.dto.UserDto;
import com.codequest.demo.model.User;
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
    public ResponseEntity<Page<UserDto>> getAllUsersPage(@PageableDefault(size = 10, sort = "id", direction= Sort.Direction.ASC) Pageable pageable) {
        Page<UserDto> users = userService.getAllUsersPage(pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/{id}/toggle-block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleBlock(@PathVariable Long id) {
        userService.toggleBlockStatus(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> passwords) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");

        userService.changePassword(userId, currentPassword, newPassword);
        
        return ResponseEntity.ok(Map.of("message", "Hasło zostało pomyślnie zmienione."));
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