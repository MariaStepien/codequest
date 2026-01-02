package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UserEquipmentDto;
import com.example.demo.service.UserEquipmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-equipment")
@RequiredArgsConstructor
public class UserEquipmentController {

    private final UserEquipmentService userEquipmentService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserEquipmentDto> getUserEquipment(@PathVariable Long userId) {
        UserEquipmentDto dto = userEquipmentService.getUserEquipment(userId);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/equip/{userId}/{equipmentId}")
    public ResponseEntity<UserEquipmentDto> equipItem(
            @PathVariable Long userId, 
            @PathVariable Long equipmentId) {
        try {
            UserEquipmentDto updatedDto = userEquipmentService.equipItem(userId, equipmentId);
            return ResponseEntity.ok(updatedDto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserEquipmentDto> getMyEquipment(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        UserEquipmentDto dto = userEquipmentService.getUserEquipment(userId);

        return ResponseEntity.ok(dto);
    }
}