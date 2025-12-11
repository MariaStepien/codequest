package com.example.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "equipment")
@NoArgsConstructor
public class Equipment {
    
    public enum EquipmentType {
        HELM,
        ARMOR,
        WEAPON,
        SHOES,
        PANTS
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentType type; // Typ equipment: HELM, ARMOR, WEAPON, SHOES, PANTS

    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private int cost;
    
    @Column(nullable = false)
    private String imgSource;
    
}