package com.example.demo.service;

import com.example.demo.domain.Report;
import com.example.demo.domain.ReportStatus;
import com.example.demo.domain.User;
import com.example.demo.repos.ReportRepository;
import com.example.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.example.demo.domain.ReportStatus.PENDING;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public Report createReport(Long reporterId, Report report) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        report.setReporter(reporter);
        report.setStatus(ReportStatus.PENDING);
        report.setCreatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByStatus(PENDING);
    }

    @Transactional
    public void resolveReport(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status);
        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);
    }
}