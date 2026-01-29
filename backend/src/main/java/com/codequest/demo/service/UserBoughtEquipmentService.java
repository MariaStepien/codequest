package com.codequest.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.dto.EquipmentDetailsDto;
import com.codequest.demo.model.Equipment;
import com.codequest.demo.model.User;
import com.codequest.demo.model.UserBoughtEquipment;
import com.codequest.demo.repository.EquipmentRepository;
import com.codequest.demo.repository.UserBoughtEquipmentRepository;
import com.codequest.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserBoughtEquipmentService {
    
    private final UserBoughtEquipmentRepository userBoughtEquipmentRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    /**
     * Retrieves all equipment owned by a specific user
     * @param userId id of the user
     * @return list of equipment details DTOs
     */
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

    /**
     * Processes a purchase of equipment for a user
     * @param userId id of the user buying the item
     * @param equipmentId id of the equipment to be purchased
     * @return the record of bought equipment
     * @throws IllegalArgumentException if userId or equipmentId is null
     * @throws RuntimeException if user or equipment is not found, or user lacks coins
     * @throws IllegalStateException if user already owns the item
     */
    @Transactional
    public UserBoughtEquipment buyEquipment(Long userId, Long equipmentId) {
        if (userId == null || equipmentId == null) {
            throw new IllegalArgumentException("Wystąpił błąd, prosimy spróbować później.");
        }
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
    
    /**
     * Gets a specific purchase record by its id
     * @param id id of the purchase record
     * @return optional containing the bought equipment record
     * @throws IllegalArgumentException if id is null
     */
    @Transactional(readOnly = true)
    public Optional<UserBoughtEquipment> getBoughtEquipmentRecordById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Wystąpił błąd, prosimy spróbować później.");
        }
        return userBoughtEquipmentRepository.findById(id);
    }
}