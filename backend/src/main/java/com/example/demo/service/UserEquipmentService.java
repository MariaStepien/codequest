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
import com.example.demo.domain.UserBoughtEquipment;
import com.example.demo.domain.UserEquipment;
import com.example.demo.dto.EquipmentDetailsDto;
import com.example.demo.dto.UserEquipmentDto;
import com.example.demo.repos.EquipmentRepository;
import com.example.demo.repos.UserBoughtEquipmentRepository;
import com.example.demo.repos.UserEquipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserEquipmentService {
    private final EquipmentRepository equipmentRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final UserBoughtEquipmentRepository userBoughtEquipmentRepository;
    
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
                .helm(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getHelmId())))
                .armor(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getArmorId())))
                .pants(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getPantsId())))
                .shoes(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getShoesId())))
                .weapon(mapEquipmentToDetailsDto(equipmentMap.get(currentEquipment.getWeaponId())))
                .ownedEquipment(ownedEquipment)
                .build();
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

        switch (equipmentToEquip.getType()) {
            case HELM:
                userEquipment.setHelmId(equipmentId);
                break;
            case ARMOR:
                userEquipment.setArmorId(equipmentId);
                break;
            case PANTS:
                userEquipment.setPantsId(equipmentId);
                break;
            case SHOES:
                userEquipment.setShoesId(equipmentId);
                break;
            case WEAPON:
                userEquipment.setWeaponId(equipmentId);
                break;
            default:
                throw new IllegalArgumentException("Nieznany typ ekwipunku: " + equipmentToEquip.getType());
        }
        
        userEquipmentRepository.save(userEquipment);
        
        return getUserEquipment(userId);
    }
    
    @Transactional
    public UserEquipmentDto unequipItem(Long userId, EquipmentType slotType) {
        UserEquipment userEquipment = userEquipmentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono ekwipunku użytkownika o ID: " + userId));

        switch (slotType) {
            case HELM:
                userEquipment.setHelmId(null);
                break;
            case ARMOR:
                userEquipment.setArmorId(null);
                break;
            case PANTS:
                userEquipment.setPantsId(null);
                break;
            case SHOES:
                userEquipment.setShoesId(null);
                break;
            case WEAPON:
                userEquipment.setWeaponId(null);
                break;
            default:
                throw new IllegalArgumentException("Nieznany typ slotu: " + slotType);
        }
        
        userEquipmentRepository.save(userEquipment);
        
        return getUserEquipment(userId);
    }
}