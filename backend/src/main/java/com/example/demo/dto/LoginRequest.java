package com.example.demo.dto;

// Note: You may need Lombok annotations for getters/setters 
// but using explicit methods for simplicity here.

public class LoginRequest {
    private String email;
    private String password;

    // Default constructor is required by Spring
    public LoginRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}