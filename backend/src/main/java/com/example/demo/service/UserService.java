package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.User;
import com.example.demo.dto.RankingEntryDto;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.repos.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.ranking.update.interval:300000}") 
    private long rankingUpdateInterval;

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
            throw new RuntimeException("Użytkownik już istnieje.");
        }

        User newUser = new User();
        newUser.setUserLogin(request.getUserLogin());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPassword(hashedPassword);

        newUser.setRole("USER");

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
                .orElseThrow(() -> new RuntimeException("Niepoprawny login lub hasło."));

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        } else {
            throw new RuntimeException("Niepoprawny login lub hasło.");
        }
    }

    /**
     * Finds a user by their unique ID.
     * @param userId The ID of the user.
     * @return The User entity.
     * @throws RuntimeException if the user is not found.
     */
    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika z ID: " + userId));
    }

    public List<RankingEntryDto> getGlobalRanking() {
        List<User> rankedUsers = userRepository.findByRoleOrderByPointsDesc("USER"); 
        
        return IntStream.range(0, rankedUsers.size())
                .mapToObj(i -> {
                    User user = rankedUsers.get(i);
                    return RankingEntryDto.builder()
                            .userId(user.getId())
                            .userLogin(user.getUserLogin())
                            .points(user.getPoints())
                            .rank(i + 1)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public RankingEntryDto getUserRankEntry(Long userId) {
        List<RankingEntryDto> globalRanking = getGlobalRanking();
        
        return globalRanking.stream()
                .filter(entry -> entry.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony w rankingu."));
    }

    @Scheduled(fixedDelayString = "${app.ranking.update.interval:300000}")
    @Transactional
    public void recalculateRanksScheduled() {
        long startTime = System.currentTimeMillis();
        System.out.println("--- ROZPOCZĘCIE przeliczania rankingu ---");
        
        try {
            List<User> rankedUsers = userRepository.findByRoleOrderByPointsDesc("USER"); 
            
            for (int i = 0; i < rankedUsers.size(); i++) {
                User user = rankedUsers.get(i);
                int newRank = i + 1; 
                
                if (user.getRank() != newRank) {
                    user.setRank(newRank);
                    userRepository.save(user); 
                }
            }
            
            long endTime = System.currentTimeMillis();
            System.out.printf("--- ZAKOŃCZENIE przeliczania rankingu. Przetworzono %d użytkowników w %d ms. ---\n", 
                              rankedUsers.size(), (endTime - startTime));

        } catch (Exception e) {
             System.err.println("Błąd podczas cyklicznego przeliczania rankingu: " + e.getMessage());
             throw new RuntimeException("Ranking update failed", e);
        }
    }
}