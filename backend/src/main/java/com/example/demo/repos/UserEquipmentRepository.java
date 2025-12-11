package com.example.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.domain.UserEquipment;

public interface UserEquipmentRepository extends JpaRepository<UserEquipment, Long> {
    
}
