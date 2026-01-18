package com.codequest.demo.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.domain.User;

/**
 * Repository for handling database operations for the Users entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their userLogin name. Essential for registration (checking for duplicates)
     * and login authentication.
     * @param userLogin The login name (e.g., username or email) to search for.
     * @return An Optional containing the Users entity if found.
     */
    Optional<User> findByUserLogin(String userLogin);

    List<User> findByRoleOrderByPointsDesc(String user);

}