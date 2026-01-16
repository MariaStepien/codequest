package com.codequest.demo.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codequest.demo.domain.Equipment;
import com.codequest.demo.domain.Equipment.EquipmentType;
import com.codequest.demo.service.EquipmentService;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addEquipment(
            @RequestPart("equipment") String equipmentJson,
            @RequestPart("file") MultipartFile file) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Equipment equipment = objectMapper.readValue(equipmentJson, Equipment.class);
            
            Equipment saved = equipmentService.saveEquipment(equipment, file);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Błąd podczas zapisywania pliku: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateEquipment(
            @PathVariable Long id,
            @RequestPart("equipment") String equipmentJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Equipment equipmentDetails = objectMapper.readValue(equipmentJson, Equipment.class);
            
            Equipment updated = equipmentService.updateEquipment(id, equipmentDetails, file);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating equipment: " + e.getMessage());
        }
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

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/next-number/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> getNextItemNumber(@PathVariable String type) {
        try {
            EquipmentType equipmentType = EquipmentType.valueOf(type.toUpperCase());
            int maxNumber = equipmentService.getMaxItemNumberByType(equipmentType);
            return ResponseEntity.ok(maxNumber + 1);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}