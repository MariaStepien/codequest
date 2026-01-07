package com.example.demo.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.Equipment.EquipmentType;

public interface EquipmentRepository extends JpaRepository<Equipment, Long>{
    List<Equipment> findByType(EquipmentType type);

    public List<Equipment> findByItemNumber(int i);

    @Query("SELECT MAX(e.itemNumber) FROM Equipment e WHERE e.type = :type")
    Integer findMaxItemNumberByType(@Param("type") EquipmentType type);

    Optional<Equipment> findByTypeAndItemNumber(Equipment.EquipmentType type, int itemNumber);
}
