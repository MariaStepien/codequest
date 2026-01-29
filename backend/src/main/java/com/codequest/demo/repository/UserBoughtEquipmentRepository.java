package com.codequest.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.model.UserBoughtEquipment;

@Repository
public interface  UserBoughtEquipmentRepository extends JpaRepository<UserBoughtEquipment, Long> {

    List<UserBoughtEquipment> findByUserId(Long userId);
    
    Optional<UserBoughtEquipment> findByUserIdAndEquipmentId(Long userId, Long equipmentId);
    
}
