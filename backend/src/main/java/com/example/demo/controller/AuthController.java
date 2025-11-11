package com.example.demo.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;

@RestController
@RequestMapping("/api/auth")
// IMPORTANT: Allows the React frontend to make requests to this backend
@CrossOrigin(origins = "http://localhost:5173") // Assuming your React app runs on port 3000
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        // --- 1. ACTUAL AUTHENTICATION LOGIC (PLACEHOLDER) ---
        
        // In a real application, you would:
        // 1. Fetch user by email (loginRequest.getEmail())
        // 2. Verify password (e.g., using a BCryptPasswordEncoder)
        // 3. Generate a JWT token if successful
        
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        // --- 2. MOCK LOGIN LOGIC FOR TESTING ---
        if ("test@example.com".equals(email) && "password123".equals(password)) {
            // Successful Login
            LoginResponse response = new LoginResponse(
                "mock-jwt-token-12345", 
                "Authentication successful!", 
                1L
            );
            return new ResponseEntity<>(response, HttpStatus.OK);

        } else if ("error@example.com".equals(email)) {
            // Simulated Incorrect Credentials
            return new ResponseEntity<>("{\"message\": \"Invalid credentials. Check email and password.\"}", HttpStatus.UNAUTHORIZED);

        } else {
             // Generic Fallback Failure
             return new ResponseEntity<>("{\"message\": \"Authentication failed.\"}", HttpStatus.UNAUTHORIZED);
        }
    }
}