package com.example.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "user_equipment")
@NoArgsConstructor
public class UserEquipment {
    @Id
    @Column(name = "user_id")
    private Long userId; 
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
    
    @Column(columnDefinition = "integer default 1")
    private int spriteNr;

    @Column(columnDefinition = "varchar(255) default 'sprite_1_1.png'")
    private String sprite_img_source;
    
    @Column(nullable = true)
    private Long helmId; 
    
    @Column(nullable = true)
    private Long armorId;
    
    @Column(nullable = true)
    private Long pantsId;
    
    @Column(nullable = true)
    private Long shoesId;
    
    @Column(nullable = true)
    private Long weaponId;
}