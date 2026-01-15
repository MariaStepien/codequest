package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.User;
import com.example.demo.domain.UserBoughtEquipment;
import com.example.demo.dto.EquipmentDetailsDto;
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

    @Transactional(readOnly = true)
    public List<EquipmentDetailsDto> getOwnedEquipmentByUserId(Long userId) {
        return userBoughtEquipmentRepository.findByUserId(userId)
                .stream()
                .map(bought -> EquipmentDetailsDto.builder()
                        .id(bought.getEquipment().getId())
                        .name(bought.getEquipment().getName())
                        .type(bought.getEquipment().getType())
                        .imgSource(bought.getEquipment().getImgSource())
                        .itemNumber(bought.getEquipment().getItemNumber())
                        .build())
                .collect(Collectors.toList());
    }

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