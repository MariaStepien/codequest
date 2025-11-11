package com.example.demo.service;

import com.example.demo.model.Users;
import com.example.demo.repos.UsersRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import com.example.demo.dto.RegisterRequest;

/**
 * Service class for handling user-related business logic, especially registration.
 */
@Service
public class UsersServiceImpl {

    private final UsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Dependency Injection (assuming you configure PasswordEncoder as a Bean)
    public UsersServiceImpl(UsersRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user.
     * @param request The registration request DTO.
     * @return The newly created Users entity.
     * @throws RuntimeException if the userLogin is already taken.
     */
    @Transactional
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
    
    // You would add login authentication logic here later (e.g., loadUserByUsername)
}