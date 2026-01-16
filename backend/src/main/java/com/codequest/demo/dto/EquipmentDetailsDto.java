package com.codequest.demo.dto;

import com.codequest.demo.domain.Equipment.EquipmentType;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EquipmentDetailsDto {
    Long id;
    String name;
    EquipmentType type;
    String imgSource;
    int itemNumber;
}