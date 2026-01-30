package com.codequest.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.model.Report;
import com.codequest.demo.model.ReportStatus;
import com.codequest.demo.repository.CommentRepository;
import com.codequest.demo.repository.LessonRepository;
import com.codequest.demo.repository.PostRepository;
import com.codequest.demo.service.ReportService;

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

    /**
     * Creates a new report.
     * Maps to the /api/reports endpoint.
     */
    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report, @RequestParam Long reporterId) {
        return ResponseEntity.ok(reportService.createReport(reporterId, report));
    }

    /**
     * Fetches a paginated list of reports, optionally filtered by status and target type.
     * Maps to the /api/reports endpoint.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Report>> getReports(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String targetType,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getFilteredReports(status, targetType, pageable));
    }

    /**
     * Updates the status of a specific report.
     * Maps to the /api/reports/{id}/status endpoint.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id, 
            @RequestParam ReportStatus status) {
        reportService.resolveReport(id, status);
        return ResponseEntity.noContent().build();
    }

    /**
     * Fetches the actual content associated with a report based on its target type.
     * Maps to the /api/reports/{id}/content endpoint.
     */
    @GetMapping("/{id}/content")
    @PreAuthorize("hasRole('ADMIN')")
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

    /**
     * Fetches the total number of reports created today.
     * Maps to the /api/reports/stats/daily-count endpoint.
     */
    @GetMapping("/stats/daily-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getDailyCount() {
        return ResponseEntity.ok(reportService.getDailyReportCount());
    }

    /**
     * Fetches the total number of reports with a pending status.
     * Maps to the /api/reports/stats/pending-count endpoint.
     */
    @GetMapping("/stats/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getPendingCount() {
        return ResponseEntity.ok(reportService.getPendingReportCount());
    }
}