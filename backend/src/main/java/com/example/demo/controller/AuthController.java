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
import com.example.demo.service.JwtService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        String login = loginRequest.getUserLogin();
        String password = loginRequest.getPassword();

        try {
            User authenticatedUser = userService.authenticateUser(login, password);
            
            String token = jwtService.generateToken(authenticatedUser.getId());

            LoginResponse response = new LoginResponse(
                token, 
                "Autoryzacja udana!", 
                authenticatedUser.getId(),
                authenticatedUser.getRole()
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
            
            return new ResponseEntity<>("{\"message\": \"Użytkownik zarejestrowany!\"}", HttpStatus.CREATED);
        } catch (RuntimeException e) {
            String jsonError = String.format("{\"message\": \"%s\"}", e.getMessage());
            return new ResponseEntity<>(jsonError, HttpStatus.BAD_REQUEST);
        }
    }
}