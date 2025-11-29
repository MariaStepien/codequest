package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    /**
     * Endpoint to fetch general admin statistics.
     * This method is protected by the @PreAuthorize annotation, requiring the user to have the 'ADMIN' role.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        // mocks for testing not used anymore
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", 4520);
        stats.put("activeCourses", 24);
        
        return ResponseEntity.ok(stats);
    }
}