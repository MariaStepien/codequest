package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UsersController {
    
    private final UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Protected endpoint to fetch the logged-in user's details.
     * The @AuthenticationPrincipal extracts the UserDetails set by the JwtAuthenticationFilter.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getLoggedInUser(@AuthenticationPrincipal UserDetails userDetails) {
        
        // 1. Get the User ID from the Security Context
        // Since we set the userId.toString() as the username in the filter, we retrieve it here.
        Long userId = Long.parseLong(userDetails.getUsername());
        
        // 2. Use the ID to perform database operation
        User loggedInUser = userService.findUserById(userId); 
        
        // 3. Return the user's information
        return ResponseEntity.ok(loggedInUser);
    }
}