package com.codequest.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.codequest.demo.domain.UserEquipment;

public interface UserEquipmentRepository extends JpaRepository<UserEquipment, Long> {
    
}
