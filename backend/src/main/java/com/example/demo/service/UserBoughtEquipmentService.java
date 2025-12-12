package com.example.demo.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.User;
import com.example.demo.domain.UserBoughtEquipment;
import com.example.demo.repos.EquipmentRepository;
import com.example.demo.repos.UserBoughtEquipmentRepository;
import com.example.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserBoughtEquipmentService {
    
    private final UserBoughtEquipmentRepository userBoughtEquipmentRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Transactional
    public UserBoughtEquipment buyEquipment(Long userId, Long equipmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika o ID: " + userId));
        
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono przedmiotu o ID: " + equipmentId));

        Optional<UserBoughtEquipment> existingItem = userBoughtEquipmentRepository.findByUserIdAndEquipmentId(userId, equipmentId);
        if (existingItem.isPresent()) {
            throw new IllegalStateException("Użytkownik już posiada ten przedmiot.");
        }
        
        int itemCost = equipment.getCost();
        
        if (user.getCoins() < itemCost) {
            throw new RuntimeException("Brak wystarczającej ilości monet na zakup przedmiotu.");
        }
        
        user.setCoins(user.getCoins() - itemCost);
        userRepository.save(user); 
        
        UserBoughtEquipment boughtEquipment = new UserBoughtEquipment();
        boughtEquipment.setUser(user);
        boughtEquipment.setEquipment(equipment);
        boughtEquipment.setType(equipment.getType());
        
        return userBoughtEquipmentRepository.save(boughtEquipment);
    }
    
    @Transactional(readOnly = true)
    public Optional<UserBoughtEquipment> getBoughtEquipmentRecordById(Long id) {
        return userBoughtEquipmentRepository.findById(id);
    }
}