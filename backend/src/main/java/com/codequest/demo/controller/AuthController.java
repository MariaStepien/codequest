package com.codequest.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.dto.LoginRequest;
import com.codequest.demo.dto.LoginResponse;
import com.codequest.demo.dto.RegisterRequest;
import com.codequest.demo.model.User;
import com.codequest.demo.service.JwtService;
import com.codequest.demo.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;

    /**
     * Authenticates a user and generates a JWT token.
     * Maps to the /api/auth/login endpoint.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        User authenticatedUser = userService.authenticateUser(
            loginRequest.getUserLogin(), 
            loginRequest.getPassword()
        );
        
        String token = jwtService.generateToken(authenticatedUser.getId());

        LoginResponse response = new LoginResponse(
            token, 
            "Autoryzacja udana!", 
            authenticatedUser.getId(),
            authenticatedUser.getRole(),
            authenticatedUser.isBlocked()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Registers a new user in the system.
     * Maps to the /api/auth/register endpoint.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        userService.registerNewUser(registerRequest);
        return new ResponseEntity<>(
            Map.of("message", "Użytkownik zarejestrowany!"), 
            HttpStatus.CREATED
        );
    }
}