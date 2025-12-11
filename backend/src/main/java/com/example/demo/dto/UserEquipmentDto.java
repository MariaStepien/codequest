package com.example.demo.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserEquipmentDto {
    Long userId;
    
    EquipmentDetailsDto helm;
    EquipmentDetailsDto armor;
    EquipmentDetailsDto pants;
    EquipmentDetailsDto shoes;
    EquipmentDetailsDto weapon;
    
    List<EquipmentDetailsDto> ownedEquipment;
    
    int spriteNr; 
}