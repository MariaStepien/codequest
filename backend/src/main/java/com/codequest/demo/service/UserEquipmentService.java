package com.codequest.demo.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.domain.Equipment;
import com.codequest.demo.domain.Equipment.EquipmentType;
import com.codequest.demo.domain.User;
import com.codequest.demo.domain.UserBoughtEquipment;
import com.codequest.demo.domain.UserEquipment;
import com.codequest.demo.dto.EquipmentDetailsDto;
import com.codequest.demo.dto.UserEquipmentDto;
import com.codequest.demo.repos.EquipmentRepository;
import com.codequest.demo.repos.UserBoughtEquipmentRepository;
import com.codequest.demo.repos.UserEquipmentRepository;
import com.codequest.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserEquipmentService {
    private final EquipmentRepository equipmentRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final UserBoughtEquipmentRepository userBoughtEquipmentRepository;
    private final UserRepository userRepository;
    private final UserBoughtEquipmentService userBoughtEquipmentService;
    
    private EquipmentDetailsDto mapEquipmentToDetailsDto(Equipment equipment) {
        if (equipment == null) return null;
        return EquipmentDetailsDto.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .imgSource(equipment.getImgSource())
                .type(equipment.getType())
                .build();
    }

    public UserEquipmentDto getUserEquipment(Long userId) {
        UserEquipment userEquipment = userEquipmentRepository.findById(userId)
                .orElseGet(() -> {
                    UserEquipment newEq = new UserEquipment();
                    newEq.setUserId(userId);
                    newEq.setSprite_img_source("sprite_1_1_1_1_1.png");
                    return userEquipmentRepository.save(newEq);
                });

        List<EquipmentDetailsDto> owned = userBoughtEquipmentService.getOwnedEquipmentByUserId(userId);

        return UserEquipmentDto.builder()
                .userId(userId)
                .spriteImgSource(userEquipment.getSprite_img_source())
                .helm(mapEquipmentToDetailsDto(userEquipment.getHelm()))
                .armor(mapEquipmentToDetailsDto(userEquipment.getArmor()))
                .pants(mapEquipmentToDetailsDto(userEquipment.getPants()))
                .shoes(mapEquipmentToDetailsDto(userEquipment.getShoes()))
                .weapon(mapEquipmentToDetailsDto(userEquipment.getWeapon()))
                .ownedEquipment(owned)
                .build();
    }

    @Transactional
    public void initializeBaseEquipment(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Equipment> baseItems = equipmentRepository.findByItemNumber(1); 
        
        if (baseItems.isEmpty()) {
            return;
        }

        UserEquipment userEquipment = new UserEquipment();
        
        userEquipment.setUser(user);
        userEquipment.setSprite_img_source("sprite_1_1_1_1_1.png");

        Map<EquipmentType, Equipment> itemsByType = baseItems.stream()
            .collect(Collectors.toMap(Equipment::getType, equipment -> equipment));

        userEquipment.setHelm(itemsByType.get(EquipmentType.HELM));
        userEquipment.setArmor(itemsByType.get(EquipmentType.ARMOR));
        userEquipment.setPants(itemsByType.get(EquipmentType.PANTS));
        userEquipment.setShoes(itemsByType.get(EquipmentType.SHOES));
        userEquipment.setWeapon(itemsByType.get(EquipmentType.WEAPON));

        userEquipmentRepository.save(userEquipment);

        List<UserBoughtEquipment> boughtItems = baseItems.stream()
            .map(equipment -> {
                UserBoughtEquipment bought = new UserBoughtEquipment();
                bought.setUser(user);
                bought.setEquipment(equipment);
                bought.setType(equipment.getType());
                return bought;
            })
            .collect(Collectors.toList());
            
        userBoughtEquipmentRepository.saveAll(boughtItems);
    }

    @Transactional
    public UserEquipmentDto equipItem(Long userId, Long equipmentId) {
        UserEquipment userEquipment = userEquipmentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono ekwipunku użytkownika"));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono przedmiotu"));

        EquipmentType type = equipment.getType();
        switch (type) {
            case HELM: userEquipment.setHelm(equipment); break;
            case ARMOR: userEquipment.setArmor(equipment); break;
            case PANTS: userEquipment.setPants(equipment); break;
            case SHOES: userEquipment.setShoes(equipment); break;
            case WEAPON: userEquipment.setWeapon(equipment); break;
            default: throw new IllegalArgumentException("Nieznany typ ekwipunku: " + type);
        }

        updateSpriteInfo(userEquipment);

        userEquipmentRepository.save(userEquipment);
        return getUserEquipment(userId);
    }

    private void updateSpriteInfo(UserEquipment userEquipment) {
        int hNum = getItemNumberOrDefault(userEquipment.getHelm());
        int aNum = getItemNumberOrDefault(userEquipment.getArmor());
        int pNum = getItemNumberOrDefault(userEquipment.getPants());
        int sNum = getItemNumberOrDefault(userEquipment.getShoes());
        int wNum = getItemNumberOrDefault(userEquipment.getWeapon());

        String newSpriteSource = String.format("sprite_%d_%d_%d_%d_%d.png", hNum, aNum, pNum, sNum, wNum);
        userEquipment.setSprite_img_source(newSpriteSource);
    }

    private int getItemNumberOrDefault(Equipment equipment) {
        if (equipment == null) return 1;
        return equipment.getItemNumber();
    }
}