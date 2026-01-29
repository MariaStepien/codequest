package com.codequest.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.codequest.demo.model.Equipment;
import com.codequest.demo.repository.EquipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SpriteService {

    private final EquipmentRepository equipmentRepository;
    private final String UPLOAD_DIR = "uploads/sprites";

    /**
     * Saves a character sprite image with name based on equipped items
     * @param hId head item id
     * @param aId armor item id
     * @param pId pants item id
     * @param sId shoes item id
     * @param wId weapon item id
     * @param file the sprite image file
     * @return the name of the saved file
     * @throws IOException if file saving fails
     */
    public String saveSprite(Long hId, Long aId, Long pId, Long sId, Long wId, MultipartFile file) throws IOException {
        int hNum = getNum(hId);
        int aNum = getNum(aId);
        int pNum = getNum(pId);
        int sNum = getNum(sId);
        int wNum = getNum(wId);

        String fileName = String.format("sprite_%d_%d_%d_%d_%d.png", hNum, aNum, pNum, sNum, wNum);
        
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    /**
     * Gets the item number associated with an equipment id
     * @param id equipment id
     * @return item number
     * @throws IllegalArgumentException if id is null
     * @throws RuntimeException if equipment is not found
     */
    private int getNum(Long id) {
        if (id == null) {
            throw new IllegalArgumentException();
        }
        return equipmentRepository.findById(id)
                .map(Equipment::getItemNumber)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono ekwipunku o ID: " + id));
    }
}