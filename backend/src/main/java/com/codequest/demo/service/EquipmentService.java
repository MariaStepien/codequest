package com.codequest.demo.service;

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

import com.codequest.demo.model.Equipment;
import com.codequest.demo.model.Equipment.EquipmentType;
import com.codequest.demo.repository.EquipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final String UPLOAD_DIR = "uploads";

   @Transactional
    public Equipment saveEquipment(Equipment equipment, MultipartFile file) throws IOException {
        equipment.setId(null);

        Integer maxNumber = equipmentRepository.findMaxItemNumberByType(equipment.getType());
        int nextNumber = (maxNumber == null) ? 1 : maxNumber + 1;
        equipment.setItemNumber(nextNumber);

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
        return equipmentRepository.findByTypeAndHiddenFalse(type);
    }

    public List<Equipment> getAllEquipmentByTypeAdmin(EquipmentType type) {
        return equipmentRepository.findByType(type);
    }

    @Transactional
    public void toggleVisibility(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        equipment.setHidden(!equipment.isHidden());
        equipmentRepository.save(equipment);
    }
    @Transactional
    public Equipment updateEquipment(Long id, Equipment equipmentDetails, MultipartFile file) throws IOException {
        Equipment currentEquipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));

            int oldNumber = currentEquipment.getItemNumber();
            int newNumber = equipmentDetails.getItemNumber();
            Equipment.EquipmentType currentType = equipmentDetails.getType();

            if (oldNumber != newNumber) {
                Optional<Equipment> equipmentToSwap = equipmentRepository.findByTypeAndItemNumber(currentType, newNumber);
                
                if (equipmentToSwap.isPresent()) {
                    Equipment otherItem = equipmentToSwap.get();
                    otherItem.setItemNumber(oldNumber);
                    equipmentRepository.save(otherItem);
                }
            }

            currentEquipment.setName(equipmentDetails.getName());
            currentEquipment.setType(currentType);
            currentEquipment.setCost(equipmentDetails.getCost());
            currentEquipment.setItemNumber(newNumber);

        if (file != null && !file.isEmpty()) {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String typeFolder = currentEquipment.getType().name().toLowerCase();
            String fileName = typeFolder + "_" + currentEquipment.getItemNumber() + extension;
            Path uploadPath = Paths.get(UPLOAD_DIR, typeFolder).toAbsolutePath().normalize();

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = UPLOAD_DIR + "/" + typeFolder + "/" + fileName;
            currentEquipment.setImgSource(relativePath);
        }

        return equipmentRepository.save(currentEquipment);
    }

    public Integer getMaxItemNumberByType(EquipmentType type) {
        Integer maxNumber = equipmentRepository.findMaxItemNumberByType(type);
        return (maxNumber == null) ? 0 : maxNumber;
    }
}