package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.Report;
import com.example.demo.domain.ReportStatus;
import com.example.demo.repos.CommentRepository;
import com.example.demo.repos.LessonRepository;
import com.example.demo.repos.PostRepository;
import com.example.demo.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final LessonRepository lessonRepository;

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report, @RequestParam Long reporterId) {
        return ResponseEntity.ok(reportService.createReport(reporterId, report));
    }

    @GetMapping
    public ResponseEntity<List<Report>> getReports(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue= "ALL") String targetType,
            @RequestParam(required = false, defaultValue = "DESC") String sort) {
        return ResponseEntity.ok(reportService.getFilteredReports(status,targetType, sort));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id, 
            @RequestParam ReportStatus status) {
        reportService.resolveReport(id, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<?> getReportedContent(@PathVariable Long id) {
        Report report = reportService.getById(id);
        if ("POST".equals(report.getTargetType())) {
            return ResponseEntity.ok(postRepository.findById(report.getTargetId()));
        } else if ("COMMENT".equals(report.getTargetType())) {
            return ResponseEntity.ok(commentRepository.findById(report.getTargetId()));
        } else if ("LESSON".equals(report.getTargetType())) {
            return ResponseEntity.ok(lessonRepository.findById(report.getTargetId()));
        }
        return ResponseEntity.badRequest().build();
    }
}