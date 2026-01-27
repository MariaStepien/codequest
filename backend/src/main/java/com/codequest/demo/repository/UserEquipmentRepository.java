package com.codequest.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.codequest.demo.model.UserEquipment;

public interface UserEquipmentRepository extends JpaRepository<UserEquipment, Long> {
    
}
