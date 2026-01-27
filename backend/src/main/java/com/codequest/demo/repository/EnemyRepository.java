package com.codequest.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.model.Enemy;

@Repository
public interface EnemyRepository extends JpaRepository<Enemy, Long> {
    boolean existsByNameIgnoreCase(String name);
}