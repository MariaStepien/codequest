package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.User;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
// NOTE: @CrossOrigin removed here because CorsConfig.java now handles CORS globally.
public class AuthController {
    
    private final UserService userService;

    // Dependency Injection for UserService
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // --- LOGIN ENDPOINT ---
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        String login = loginRequest.getUserLogin();
        String password = loginRequest.getPassword();

        try {
            // --- ACTUAL AUTHENTICATION LOGIC ---
            // 1. Call UserService to find the user and verify the password hash.
            User authenticatedUser = userService.authenticateUser(login, password);

            // 2. If authentication succeeds, build the response.
            // NOTE: In a real app, you would generate a JWT token here.
            LoginResponse response = new LoginResponse(
                "mock-jwt-token-for-user-" + authenticatedUser.getId(), 
                "Authentication successful!", 
                authenticatedUser.getId()
            );
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            // This catches the "Invalid login or password." exception from UserService
            String jsonError = String.format("{\"message\": \"%s\"}", e.getMessage());
            // Use UNAUTHORIZED status for authentication failures
            return new ResponseEntity<>(jsonError, HttpStatus.UNAUTHORIZED); 
        }
    }

    // --- REGISTRATION ENDPOINT ---
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            // Delegates the hashing and saving logic to the UserService
            userService.registerNewUser(registerRequest);
            
            // Success response is also wrapped in JSON for consistency
            return new ResponseEntity<>("{\"message\": \"User registered successfully!\"}", HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Catches the exception (e.g., user already exists) and returns the message wrapped as a JSON object
            String jsonError = String.format("{\"message\": \"%s\"}", e.getMessage());
            return new ResponseEntity<>(jsonError, HttpStatus.BAD_REQUEST);
        }
    }
}