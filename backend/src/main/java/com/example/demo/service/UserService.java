package com.example.demo.service;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.Users;
import com.example.demo.repos.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Dependency Injection for Repository and Encoder
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user. Throws an exception if the login name already exists.
     * @param request DTO containing userLogin and password.
     * @return The newly created Users entity.
     */
    public Users registerNewUser(RegisterRequest request) {
        // 1. Check if user already exists
        Optional<Users> existingUser = userRepository.findByUserLogin(request.getUserLogin());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with login '" + request.getUserLogin() + "' already exists.");
        }

        // 2. Create the Users entity
        Users newUser = new Users();
        newUser.setUserLogin(request.getUserLogin());

        // 3. Hash the password before saving (CRITICAL SECURITY STEP)
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPassword(hashedPassword);

        // 4. Save to the database
        return userRepository.save(newUser);
    }
    
    /**
     * Authenticates a user based on login and password.
     * @param userLogin The user's login name.
     * @param password The raw password provided by the user.
     * @return The authenticated Users entity.
     * @throws RuntimeException if the user is not found or the password is incorrect.
     */
    public Users authenticateUser(String userLogin, String password) {
        // 1. Find the user by login name
        Users user = userRepository.findByUserLogin(userLogin)
                .orElseThrow(() -> new RuntimeException("Invalid login or password."));

        // 2. Verify the raw password against the stored hashed password
        if (passwordEncoder.matches(password, user.getPassword())) {
            return user; // Authentication successful
        } else {
            throw new RuntimeException("Invalid login or password.");
        }
    }
}