package com.example.demo.dto;

public class LoginRequest {
    private String userLogin;
    private String password;

    public LoginRequest() {}

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