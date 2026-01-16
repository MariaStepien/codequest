package com.codequest.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message="Nazwa użytkownika jest wymagana.")
    @Size(min = 4, max = 20)
    private String userLogin;

    @NotBlank(message="Hasło jest wymagane.")
    @Size(min = 8, message="Hasło musi zawierać conajmniej 8 znaków.")
    private String password;

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
