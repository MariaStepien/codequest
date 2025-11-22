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
public class AuthController {
    
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        String login = loginRequest.getUserLogin();
        String password = loginRequest.getPassword();

        try {
            User authenticatedUser = userService.authenticateUser(login, password);

            LoginResponse response = new LoginResponse(
                "mock-jwt-token-for-user-" + authenticatedUser.getId(), 
                "Authentication successful!", 
                authenticatedUser.getId()
            );
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            String jsonError = String.format("{\"message\": \"%s\"}", e.getMessage());
            return new ResponseEntity<>(jsonError, HttpStatus.UNAUTHORIZED); 
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            userService.registerNewUser(registerRequest);
            
            return new ResponseEntity<>("{\"message\": \"User registered successfully!\"}", HttpStatus.CREATED);
        } catch (RuntimeException e) {
            String jsonError = String.format("{\"message\": \"%s\"}", e.getMessage());
            return new ResponseEntity<>(jsonError, HttpStatus.BAD_REQUEST);
        }
    }
}