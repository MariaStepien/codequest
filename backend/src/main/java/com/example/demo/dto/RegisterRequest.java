package com.example.demo.dto;

public class RegisterRequest {
    private String userLogin;
    private String password;

    // Default constructor is required by Spring
    public RegisterRequest() {}

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
