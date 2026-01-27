package com.codequest.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.model.UserBoughtEquipment;
import com.codequest.demo.service.UserBoughtEquipmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-bought-equipment")
@RequiredArgsConstructor
public class UserBoughtEquipmentController {

    private final UserBoughtEquipmentService userBoughtEquipmentService;

    @PostMapping("/buy/{userId}/{equipmentId}")
    public ResponseEntity<UserBoughtEquipment> buyEquipment(
            @PathVariable Long userId, 
            @PathVariable Long equipmentId) {
        try {
            UserBoughtEquipment boughtEquipment = userBoughtEquipmentService.buyEquipment(userId, equipmentId);
            return new ResponseEntity<>(boughtEquipment, HttpStatus.CREATED); 
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}