package com.example.demo.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.Equipment.EquipmentType;

public interface EquipmentRepository extends JpaRepository<Equipment, Long>{
    List<Equipment> findByType(EquipmentType type);
}
