package com.example.demo.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.Equipment.EquipmentType;
import com.example.demo.domain.User;
import com.example.demo.domain.UserBoughtEquipment;
import com.example.demo.domain.UserEquipment;
import com.example.demo.dto.EquipmentDetailsDto;
import com.example.demo.dto.UserEquipmentDto;
import com.example.demo.repos.EquipmentRepository;
import com.example.demo.repos.UserBoughtEquipmentRepository;
import com.example.demo.repos.UserEquipmentRepository;
import com.example.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserEquipmentService {
    private final EquipmentRepository equipmentRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final UserBoughtEquipmentRepository userBoughtEquipmentRepository;
    private final UserRepository userRepository;
    
    private EquipmentDetailsDto mapEquipmentToDetailsDto(Equipment equipment) {
        if (equipment == null) return null;
        return EquipmentDetailsDto.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .type(equipment.getType().toString())
                .imgSource(equipment.getImgSource())
                .itemNumber(equipment.getItemNumber())
                .build();
    }
    
    @Transactional(readOnly = true)
    public UserEquipmentDto getUserEquipment(Long userId) {
        UserEquipment currentEquipment = userEquipmentRepository.findById(userId)
            .orElseGet(() -> {
                UserEquipment defaultEq = new UserEquipment();
                defaultEq.setUserId(userId);
                defaultEq.setSprite_img_source("sprite_1_1_1_1_1.png");
                return defaultEq; 
            });

        List<UserBoughtEquipment> boughtItems = userBoughtEquipmentRepository.findByUserId(userId);
        
        List<Long> equipmentIds = boughtItems.stream()
                .map(ube -> ube.getEquipment().getId())
                .collect(Collectors.toList());
        
        Optional.ofNullable(currentEquipment.getHelmId()).ifPresent(equipmentIds::add);
        Optional.ofNullable(currentEquipment.getArmorId()).ifPresent(equipmentIds::add);
        Optional.ofNullable(currentEquipment.getPantsId()).ifPresent(equipmentIds::add);
        Optional.ofNullable(currentEquipment.getShoesId()).ifPresent(equipmentIds::add);
        Optional.ofNullable(currentEquipment.getWeaponId()).ifPresent(equipmentIds::add);
        
        List<Equipment> allEquipment = equipmentRepository.findAllById(equipmentIds.stream().distinct().collect(Collectors.toList()));
        
        Map<Long, Equipment> equipmentMap = allEquipment.stream()
            .collect(Collectors.toMap(Equipment::getId, Function.identity()));

        List<EquipmentDetailsDto> ownedEquipment = boughtItems.stream()
            .map(ube -> equipmentMap.get(ube.getEquipment().getId()))
            .filter(e -> e != null)
            .map(this::mapEquipmentToDetailsDto)
            .collect(Collectors.toList());

        return UserEquipmentDto.builder()
                .userId(userId)
                .spriteNr(currentEquipment.getSpriteNr())
                .spriteImgSource(currentEquipment.getSprite_img_source())
                .helm(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getHelmId())))
                .armor(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getArmorId())))
                .pants(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getPantsId())))
                .shoes(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getShoesId())))
                .weapon(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getWeaponId())))
                .ownedEquipment(ownedEquipment)
                .build();
    }

    @Transactional
    public void initializeBaseEquipment(Long userId) {
        List<Equipment> baseItems = equipmentRepository.findByItemNumber(1); 
        
        if (baseItems.isEmpty()) {
            System.err.println("Brak podstawowych przedmiotów (itemNumber=1) w bazie danych. Inicjalizacja ekwipunku pominięta.");
            return;
        }

        UserEquipment userEquipment = new UserEquipment();
        userEquipment.setUserId(userId);
        userEquipment.setSpriteNr(1);
        userEquipment.setSprite_img_source("sprite_1_1_1_1_1.png");
        
        Map<EquipmentType, Long> itemIdsByType = baseItems.stream()
            .collect(Collectors.toMap(Equipment::getType, Equipment::getId));
        
        userEquipment.setHelmId(itemIdsByType.get(EquipmentType.HELM));
        userEquipment.setArmorId(itemIdsByType.get(EquipmentType.ARMOR));
        userEquipment.setPantsId(itemIdsByType.get(EquipmentType.PANTS));
        userEquipment.setShoesId(itemIdsByType.get(EquipmentType.SHOES));
        userEquipment.setWeaponId(itemIdsByType.get(EquipmentType.WEAPON));
        
        userEquipmentRepository.save(userEquipment);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika do inicjalizacji ekwipunku."));
        
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
        UserBoughtEquipment ownedItem = userBoughtEquipmentRepository.findByUserIdAndEquipmentId(userId, equipmentId)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie posiada przedmiotu o ID: " + equipmentId));
        
        Equipment equipmentToEquip = ownedItem.getEquipment();
        UserEquipment userEquipment = userEquipmentRepository.findById(userId)
                .orElseGet(() -> {
                    UserEquipment newEq = new UserEquipment();
                    newEq.setUserId(userId);
                    return newEq;
                });

        EquipmentType type = equipmentToEquip.getType();
        switch (type) {
            case HELM: userEquipment.setHelmId(equipmentId); break;
            case ARMOR: userEquipment.setArmorId(equipmentId); break;
            case PANTS: userEquipment.setPantsId(equipmentId); break;
            case SHOES: userEquipment.setShoesId(equipmentId); break;
            case WEAPON: userEquipment.setWeaponId(equipmentId); break;
            default: throw new IllegalArgumentException("Nieznany typ ekwipunku: " + type);
        }

        updateSpriteInfo(userEquipment);

        userEquipmentRepository.save(userEquipment);
        return getUserEquipment(userId);
    }

    private void updateSpriteInfo(UserEquipment userEquipment) {
        int hNum = getItemNumberOrDefault(userEquipment.getHelmId());
        int aNum = getItemNumberOrDefault(userEquipment.getArmorId());
        int pNum = getItemNumberOrDefault(userEquipment.getPantsId());
        int sNum = getItemNumberOrDefault(userEquipment.getShoesId());
        int wNum = getItemNumberOrDefault(userEquipment.getWeaponId());

        String newSpriteSource = String.format("sprite_%d_%d_%d_%d_%d.png", hNum, aNum, pNum, sNum, wNum);
        userEquipment.setSprite_img_source(newSpriteSource);
    }

    private int getItemNumberOrDefault(Long equipmentId) {
        if (equipmentId == null) return 1;
        return equipmentRepository.findById(equipmentId)
                .map(Equipment::getItemNumber)
                .orElse(1);
    }
}