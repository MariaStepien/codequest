package com.example.demo.controller;

import java.util.Map;

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
import com.example.demo.service.JwtService;
import com.example.demo.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;

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
            authenticatedUser.getRole()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        userService.registerNewUser(registerRequest);
        return new ResponseEntity<>(
            Map.of("message", "Użytkownik zarejestrowany!"), 
            HttpStatus.CREATED
        );
    }
}