package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.domain.Enemy;
import com.example.demo.service.EnemyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enemies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EnemyController {

    private final EnemyService enemyService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addEnemy(
            @RequestParam String name,
            @RequestParam MultipartFile file) {
        try {
            Enemy saved = enemyService.saveEnemy(name, file);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Błąd serwera");
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Enemy>> getAllEnemies() {
        return ResponseEntity.ok(enemyService.getAllEnemies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enemy> getEnemy(@PathVariable Long id) {
        return ResponseEntity.ok(enemyService.getEnemyById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateEnemy(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) MultipartFile file) {
        try {
            Enemy updated = enemyService.updateEnemy(id, name, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Błąd serwera");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEnemy(@PathVariable Long id) {
        try {
            enemyService.deleteEnemy(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Błąd podczas usuwania: " + e.getMessage());
        }
    }
}