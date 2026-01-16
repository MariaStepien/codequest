package com.codequest.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.domain.Enemy;

@Repository
public interface EnemyRepository extends JpaRepository<Enemy, Long> {
    boolean existsByNameIgnoreCase(String name);
}