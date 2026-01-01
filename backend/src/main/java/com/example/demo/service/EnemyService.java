package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.domain.Enemy;
import com.example.demo.repos.EnemyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnemyService {

    private final EnemyRepository enemyRepository;
    private final String UPLOAD_DIR = "uploads/enemies";

    @Transactional
    public Enemy saveEnemy(String name, MultipartFile file) throws IOException {
        if (enemyRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Przeciwnik o tej nazwie już istnieje");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = name.toLowerCase().replaceAll("\\s+", "_") + ".png";
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Enemy enemy = new Enemy();
        enemy.setName(name);
        enemy.setImgSource(UPLOAD_DIR + "/" + fileName);

        return enemyRepository.save(enemy);
    }

    @Transactional(readOnly = true)
    public List<Enemy> getAllEnemies() {
    return enemyRepository.findAll();
    }

    @Transactional
    public Enemy updateEnemy(Long id, String name, MultipartFile file) throws IOException {
        Enemy enemy = enemyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono przeciwnika o tym ID"));

        if (!enemy.getName().equalsIgnoreCase(name) && enemyRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Przeciwnik o tej nazwie już istnieje");
        }

        enemy.setName(name);

        if (file != null && !file.isEmpty()) {
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            String fileName = name.toLowerCase().replaceAll("\\s+", "_") + ".png";
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            enemy.setImgSource(UPLOAD_DIR + "/" + fileName);
        }

        return enemyRepository.save(enemy);
    }

    @Transactional(readOnly = true)
    public Enemy getEnemyById(Long id) {
        return enemyRepository.findById(id)
                .orElseThrow();
    }

    @Transactional
    public void deleteEnemy(Long id) throws IOException {
        Enemy enemy = enemyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono przeciwnika o tym ID"));

        Path filePath = Paths.get(enemy.getImgSource()).toAbsolutePath().normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Could not delete file: " + filePath);
        }

        enemyRepository.delete(enemy);
    }
}