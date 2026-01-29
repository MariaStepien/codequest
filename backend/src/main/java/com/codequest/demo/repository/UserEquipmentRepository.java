package com.codequest.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.model.UserEquipment;

@Repository
public interface UserEquipmentRepository extends JpaRepository<UserEquipment, Long> {
    
}
