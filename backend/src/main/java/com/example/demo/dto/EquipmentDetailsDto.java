package com.example.demo.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EquipmentDetailsDto {
    Long id;
    String name;
    String type;
    String imgSource;
    int itemNumber;
}