package com.codequest.demo.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.dto.EquipmentDetailsDto;
import com.codequest.demo.dto.UserEquipmentDto;
import com.codequest.demo.model.Equipment;
import com.codequest.demo.model.Equipment.EquipmentType;
import com.codequest.demo.model.User;
import com.codequest.demo.model.UserBoughtEquipment;
import com.codequest.demo.model.UserEquipment;
import com.codequest.demo.repository.EquipmentRepository;
import com.codequest.demo.repository.UserBoughtEquipmentRepository;
import com.codequest.demo.repository.UserEquipmentRepository;
import com.codequest.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserEquipmentService {
    private final EquipmentRepository equipmentRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final UserBoughtEquipmentRepository userBoughtEquipmentRepository;
    private final UserRepository userRepository;
    private final UserBoughtEquipmentService userBoughtEquipmentService;
    
    /**
     * Maps equipment entity to its details DTO
     * @param equipment equipment entity
     * @return equipment details DTO or null if equipment is null
     */
    private EquipmentDetailsDto mapEquipmentToDetailsDto(Equipment equipment) {
        if (equipment == null) return null;
        return EquipmentDetailsDto.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .imgSource(equipment.getImgSource())
                .type(equipment.getType())
                .build();
    }

    /**
     * Gets current equipment and owned items for a specific user
     * @param userId id of the user
     * @return user equipment DTO including sprite and owned items
     */
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

    /**
     * Assigns base equipment to a new user(items with item number 1)
     * @param userId id of the user
     * @throws RuntimeException if user is not found
     * @throws IllegalArgumentException if no id was given
     */
    @Transactional
    public void initializeBaseEquipment(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Wystąpił błąd, prosimy spróbować później.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nieznaleziono użytkownika."));

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

    /**
     * Updates user's active equipment with a new item
     * @param userId id of the user
     * @param equipmentId id of the item to equip
     * @return updated user equipment DTO
     * @throws RuntimeException if user equipment or item is not found
     * @throws IllegalArgumentException if equipment type is unknown or id was not given
     */
    @Transactional
    public UserEquipmentDto equipItem(Long userId, Long equipmentId) {
        if (userId == null || equipmentId == null) {
            throw new IllegalArgumentException("Wystąpił błąd, prosimy spróbować później.");
        }
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

    /**
     * Updates the sprite image source string based on current equipment numbers
     * @param userEquipment user equipment entity
     */
    private void updateSpriteInfo(UserEquipment userEquipment) {
        int hNum = getItemNumberOrDefault(userEquipment.getHelm());
        int aNum = getItemNumberOrDefault(userEquipment.getArmor());
        int pNum = getItemNumberOrDefault(userEquipment.getPants());
        int sNum = getItemNumberOrDefault(userEquipment.getShoes());
        int wNum = getItemNumberOrDefault(userEquipment.getWeapon());

        String newSpriteSource = String.format("sprite_%d_%d_%d_%d_%d.png", hNum, aNum, pNum, sNum, wNum);
        userEquipment.setSprite_img_source(newSpriteSource);
    }

    /**
     * Gets item number from equipment or returns default value of 1
     * @param equipment equipment entity
     * @return item number
     */
    private int getItemNumberOrDefault(Equipment equipment) {
        if (equipment == null) return 1;
        return equipment.getItemNumber();
    }
}