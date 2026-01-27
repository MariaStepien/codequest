package com.codequest.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
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
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "varchar(255) default 'sprite_1_1_1_1_1.png'")
    private String sprite_img_source;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "helm_id")
    private Equipment helm; 
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "armor_id")
    private Equipment armor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pants_id")
    private Equipment pants;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shoes_id")
    private Equipment shoes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weapon_id")
    private Equipment weapon;
}