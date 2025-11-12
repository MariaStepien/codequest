package com.example.demo.dto;

public class LoginRequest {
    private String userLogin; // Changed from email
    private String password;

    // Default constructor is required by Spring
    public LoginRequest() {}

    public String getUserLogin() { // Changed from getEmail()
        return userLogin;
    }

    public void setUserLogin(String userLogin) { // Changed from setEmail()
        this.userLogin = userLogin;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}