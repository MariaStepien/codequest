package com.example.demo.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.domain.User;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.repos.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user. Throws an exception if the login name already exists.
     * @param request DTO containing userLogin and password.
     * @return The newly created Users entity.
     */
    public User registerNewUser(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByUserLogin(request.getUserLogin());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with login '" + request.getUserLogin() + "' already exists.");
        }

        User newUser = new User();
        newUser.setUserLogin(request.getUserLogin());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPassword(hashedPassword);

        return userRepository.save(newUser);
    }
    
    /**
     * Authenticates a user based on login and password.
     * @param userLogin The user's login name.
     * @param password The raw password provided by the user.
     * @return The authenticated Users entity.
     * @throws RuntimeException if the user is not found or the password is incorrect.
     */
    public User authenticateUser(String userLogin, String password) {
        User user = userRepository.findByUserLogin(userLogin)
                .orElseThrow(() -> new RuntimeException("Invalid login or password."));

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        } else {
            throw new RuntimeException("Invalid login or password.");
        }
    }
}