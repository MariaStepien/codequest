package com.codequest.demo.dto;

public class LoginResponse {
    private String token;
    private String message;
    private Long userId;
    private String role;
    private Boolean isBlocked;

    public LoginResponse(String token, String message, Long userId, String role, Boolean isBlocked) {
        this.token = token;
        this.message = message;
        this.userId = userId;
        this.role = role;
        this.isBlocked = isBlocked;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
    }
}