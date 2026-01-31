package com.codequest.demo.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.codequest.demo.dto.RankingEntryDto;
import com.codequest.demo.dto.RegisterRequest;
import com.codequest.demo.dto.UserDto;
import com.codequest.demo.model.User;
import com.codequest.demo.repository.UserRepository;

import jakarta.validation.Valid;

@Service
@Validated
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEquipmentService userEquipmentService;

    @Value("${app.hearts.max:5}")
    private int maxHearts;

    @Value("${app.hearts.regen-minutes:30}")
    private int minutesPerHeart;

    @Value("${app.ranking.update.interval:300000}") 
    private long rankingUpdateInterval;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserEquipmentService userEquipmentService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userEquipmentService = userEquipmentService;
    }

    /**
     * Registers a new user. Throws an exception if the login name already exists.
     * @param request DTO containing userLogin and password.
     * @return The newly created Users entity.
     */
    @Transactional
    public User registerNewUser(@Valid RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByUserLogin(request.getUserLogin());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Wybrana nazwa użytkownika jest już zajęta. Spróbuj innej.");
        }

        User newUser = new User();
        newUser.setUserLogin(request.getUserLogin());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPassword(hashedPassword);

        newUser.setRole("USER");
        newUser.setCoins(0);
        newUser.setPoints(0);
        newUser.setRank(0);
        newUser.setHearts(5);

        User savedUser = userRepository.save(newUser);

        userEquipmentService.initializeBaseEquipment(savedUser.getId());

        return savedUser;
    }

    /**
     * Allows to toggle status between blocked and not blocked user
     * @param userId id of user whos status will change
     */
    @Transactional
    public void toggleBlockStatus(Long userId) {
        User user = findUserById(userId);
        user.setBlocked(!user.isBlocked());
        userRepository.save(user);
    }

    /**
     * Allows to block user
     * @param userId id of user who will be blocked
     */
    @Transactional
    public void blockUser(Long userId) {
        User user = findUserById(userId);
        user.setBlocked(true);
        userRepository.save(user);
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

        if (user.isBlocked()) {
            throw new RuntimeException("Twoje konto zostało zablokowane. Skontaktuj się z administratorem.");
        }
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

    /**
     * Gets all users
     * @return list of users mapped to DTO
     */
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Gets all users with pagination
     * @param pageable pagination information
     * @return page of users mapped to DTO
     */
    public Page<UserDto> getAllUsersPage(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::convertToDto);
    }

    /**
     * Converts given user to DTO 
     * @return user mapped to DTO
     */
    public UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .login(user.getUserLogin())
                .role(user.getRole())
                .coins(user.getCoins())
                .points(user.getPoints())
                .rank(user.getRank())
                .hearts(user.getHearts())
                .lastHeartRecovery(user.getLastHeartRecovery())
                .isBlocked(user.isBlocked())
                .build();
    }

    /**
     * Allows user to change password
     * @param userId id of the user
     * @param currentPassword string with current password of user
     * @param newPassword string of new password of user
     * @throws RuntimeException if one of passwords is incorrect
     */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Obecne hasło jest nieprawidłowe.");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("Nowe hasło musi być inne niż obecne.");
        }

        if (newPassword.length() < 8 || newPassword.length() >= 72) {
            throw new RuntimeException("Nowe hasło musi zawierać pomiędzy 8 a 72 znakami.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Gets ranking
     * @return ranking
     */
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

    /**
     * Gets user ranking position
     * @param userId id of the user
     * @throws RuntimeException if user is not found
     * @return ranking of user
     */
    public RankingEntryDto getUserRankEntry(Long userId) {
        List<RankingEntryDto> globalRanking = getGlobalRanking();
        
        return globalRanking.stream()
                .filter(entry -> entry.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony w rankingu."));
    }

    /**
     * Scheduled method for updating user ranking in database. (base interval is 5 min)
     */
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

    /**
     * Returns user with recharged hearts
     * @param userId id of the user
     * @return User entity object
     */
    public User getUserWithRechargedHearts(Long userId) {
        User user = findUserById(userId);
        int maxHearts = 5;
        long minutesPerHeart = 30;
        if (user.getHearts() < maxHearts && user.getLastHeartRecovery() != null) {
            long minutesPassed = java.time.Duration.between(user.getLastHeartRecovery(), LocalDateTime.now()).toMinutes();
            int heartsToAdd = (int) (minutesPassed / minutesPerHeart);

            if (heartsToAdd > 0) {
                int newHeartCount = Math.min(maxHearts, user.getHearts() + heartsToAdd);
                user.setHearts(newHeartCount);
                user.setLastHeartRecovery(user.getLastHeartRecovery().plusMinutes(heartsToAdd * minutesPerHeart));
                userRepository.save(user);
            }
        }
        return user;
    }

    /**
     * Deducts one heart from user's health
     * @param userId id of the user
     * @throws RuntimeException if user is not found or has no hearts left
     */
    @Transactional
    public User consumeHeart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika."));

        if (user.getHearts() <= 0) {
            throw new RuntimeException("Brak dostępnych serc! Poczekaj na regenerację.");
        }

        if (user.getHearts() == 5) {
            user.setLastHeartRecovery(LocalDateTime.now());
        }

        user.setHearts(user.getHearts() - 1);
        return userRepository.save(user);
    }

    /**
     * Allows user to purchase a heart using coins
     * @param userId id of the user
     * @return updated user entity
     * @throws RuntimeException if user is not found, has max hearts, or lacks coins
     */
    @Transactional
    public User buyHeart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika."));

        if (user.getHearts() >= maxHearts) {
            throw new RuntimeException("Masz już maksymalną liczbę serc.");
        }

        if (user.getCoins() < 20) {
            throw new RuntimeException("Nie masz wystarczającej liczby monet (wymagane 20).");
        }

        user.setCoins(user.getCoins() - 20);
        user.setHearts(user.getHearts() + 1);
        
        return userRepository.save(user);
    }

    /**
     * Scheduled task to regenerate hearts over time for all users
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void regenerateHeartsScheduled() {
        List<User> usersWithMissingHearts = userRepository.findAll().stream()
                .filter(u -> u.getHearts() < maxHearts)
                .toList();

        LocalDateTime now = LocalDateTime.now();

        for (User user : usersWithMissingHearts) {
            if (user.getLastHeartRecovery() == null) {
                user.setLastHeartRecovery(now);
                userRepository.save(user);
                continue;
            }

            long minutesPassed = Duration.between(user.getLastHeartRecovery(), now).toMinutes();
            int heartsToAdd = (int) (minutesPassed / minutesPerHeart);

            if (heartsToAdd > 0) {
                int newHeartCount = Math.min(maxHearts, user.getHearts() + heartsToAdd);
                user.setHearts(newHeartCount);
                
                user.setLastHeartRecovery(user.getLastHeartRecovery().plusMinutes(heartsToAdd * minutesPerHeart));
                userRepository.save(user);
            }
        }
    }
}