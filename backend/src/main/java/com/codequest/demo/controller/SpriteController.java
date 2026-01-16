package com.codequest.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codequest.demo.service.SpriteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sprites")
@RequiredArgsConstructor
public class SpriteController {

    private final SpriteService spriteService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadSprite(
            @RequestParam Long helmId,
            @RequestParam Long armorId,
            @RequestParam Long pantsId,
            @RequestParam Long shoesId,
            @RequestParam Long weaponId,
            @RequestParam MultipartFile file) {
        try {
            String fileName = spriteService.saveSprite(helmId, armorId, pantsId, shoesId, weaponId, file);
            return ResponseEntity.ok(Map.of("message", "Sprite saved successfully", "fileName", fileName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}