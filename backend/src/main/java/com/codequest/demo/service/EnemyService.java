package com.codequest.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codequest.demo.model.Enemy;
import com.codequest.demo.repository.EnemyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnemyService {

    private final EnemyRepository enemyRepository;
    private final String UPLOAD_DIR = "uploads/enemies";

    /**
     * Saves a new enemy.
     * @param name the name of the enemy.
     * @param file the image file to be uploaded.
     * @return the saved Enemy object.
     * @throws RuntimeException if an enemy with the same name already exists.
     * @throws IOException if there is an error during file saving.
     */
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

        try {
            return enemyRepository.save(enemy);
        } catch (Exception e) {
            throw new RuntimeException("Błąd zapisu do bazy danych.");
        }
    }

    /**
     * Retrieves all enemies from the database.
     * @return a list of all enemies.
     */
    @Transactional(readOnly = true)
    public List<Enemy> getAllEnemies() {
    return enemyRepository.findAll();
    }

    /**
     * Updates an existing enemy's details.
     * @param id the Id of the enemy to update.
     * @param name the new name for the enemy.
     * @param file the new image file (optional).
     * @return the updated Enemy object.
     * @throws RuntimeException if the enemy Id is not found.
     * @throws IOException if there is an error during file processing.
     */
    @Transactional
    public Enemy updateEnemy(Long id, String name, MultipartFile file) throws IOException {
        if (id == null) {
            throw new IllegalArgumentException("ID przeciwnika nieznalezione.");
        }
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

        try {
            return enemyRepository.save(enemy);
        } catch (Exception e) {
            throw new RuntimeException("Błąd zapisu do bazy danych.");
        }
    }

    /**
     * Finds an enemy by its Id.
     * @param id the Id of the enemy.
     * @return the found Enemy object.
     * @throws IllegalArgumentException if the Id is null.
     * @throws RuntimeException if no enemy is found with the given Id.
     */
    @Transactional(readOnly = true)
    public Enemy getEnemyById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        return enemyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono przeciwnika o tym ID"));
    }

    /**
     * Deletes an enemy and its associated image file.
     * @param id the Id of the enemy to delete.
     * @throws IllegalArgumentException if the Id is null.
     * @throws RuntimeException if the enemy is not found.
     * @throws IOException if there is an error during file deletion.
     */
    @Transactional
    public void deleteEnemy(Long id) throws IOException {
        if (id == null) {
            throw new IllegalArgumentException("ID przeciwnika nieznalezione.");
        }
        Enemy enemy = enemyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono przeciwnika o tym ID"));

        Path filePath = Paths.get(enemy.getImgSource()).toAbsolutePath().normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Nie udało się usunąć pliku przeciwnika: " + filePath);
        }

        try {
            enemyRepository.delete(enemy);
        } catch (Exception e) {
            throw new RuntimeException("Błąd usuwania.");
        }
    }
}