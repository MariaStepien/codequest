package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.domain.Equipment;
import com.example.demo.domain.Equipment.EquipmentType;
import com.example.demo.repos.EquipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final String UPLOAD_DIR = "uploads";

   @Transactional
    public Equipment saveEquipment(Equipment equipment, MultipartFile file) throws IOException {
        equipment.setId(null);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String typeFolder = equipment.getType().name().toLowerCase();
        String fileName = equipment.getType().name().toLowerCase() + "_" + equipment.getItemNumber() + extension;
        Path uploadPath = Paths.get(UPLOAD_DIR, typeFolder).toAbsolutePath().normalize();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path targetLocation = uploadPath.resolve(fileName);
        
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        String relativePath = UPLOAD_DIR + "/" + typeFolder + "/" + fileName;
        equipment.setImgSource(relativePath);

        return equipmentRepository.save(equipment);
    }

    @Transactional(readOnly = true)
    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<Equipment> getEquipmentByType(EquipmentType type) {
        return equipmentRepository.findByType(type);
    }

    @Transactional
    public Equipment updateEquipment(Long id, Equipment equipmentDetails, MultipartFile file) throws IOException {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));

        equipment.setName(equipmentDetails.getName());
        equipment.setType(equipmentDetails.getType());
        equipment.setCost(equipmentDetails.getCost());
        equipment.setItemNumber(equipmentDetails.getItemNumber());

        if (file != null && !file.isEmpty()) {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String typeFolder = equipment.getType().name().toLowerCase();
            String fileName = typeFolder + "_" + equipment.getItemNumber() + extension;
            Path uploadPath = Paths.get(UPLOAD_DIR, typeFolder).toAbsolutePath().normalize();

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = UPLOAD_DIR + "/" + typeFolder + "/" + fileName;
            equipment.setImgSource(relativePath);
        }

        return equipmentRepository.save(equipment);
    }
}