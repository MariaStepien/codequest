package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.Equipment.EquipmentType;
import com.example.demo.service.EquipmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    /**
     * Adds new item to equipment table.
     * Endpoint: POST /api/equipment
     * @param equipment new item data.
     * @return Saved Equipment.
     */
    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        Equipment savedEquipment = equipmentService.saveEquipment(equipment);
        return new ResponseEntity<>(savedEquipment, HttpStatus.CREATED); 
    }

    /**
     * Gets all equipment of specified type.
     * Endpoint: GET /api/equipment/type/{type}
     * @param type Equipment type is given in api.
     * @return Returns list of items matching given type.
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Equipment>> getEquipmentByType(@PathVariable String type) {
        try {
            EquipmentType equipmentType = EquipmentType.valueOf(type.toUpperCase());
            List<Equipment> equipmentList = equipmentService.getEquipmentByType(equipmentType);
            
            if (equipmentList.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
            }
            
            return ResponseEntity.ok(equipmentList);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * 
     * @return returns all equipment.
     */
    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        List<Equipment> allEquipment = equipmentService.getAllEquipment();
        return ResponseEntity.ok(allEquipment);
    }
}