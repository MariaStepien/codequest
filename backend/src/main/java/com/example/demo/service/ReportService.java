package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Report;
import com.example.demo.domain.ReportStatus;
import com.example.demo.domain.User;
import com.example.demo.repos.ReportRepository;
import com.example.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

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

    public List<Report> getFilteredReports(String status, String targetType, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
                    ? Sort.by("createdAt").ascending() 
                    : Sort.by("createdAt").descending();

        boolean statusAll = (status == null || status.equals("ALL"));
        boolean targetTypeAll = (targetType == null || targetType.equals("ALL"));

        if (statusAll && targetTypeAll) {
            return reportRepository.findAll(sort);
        } else if (!statusAll && targetTypeAll) {
            return reportRepository.findByStatus(ReportStatus.valueOf(status), sort);
        } else if (statusAll && !targetTypeAll) {
            return reportRepository.findByTargetType(targetType, sort);
        } else {
            return reportRepository.findByStatusAndTargetType(ReportStatus.valueOf(status), targetType, sort);
        }
    }

    @Transactional
    public void resolveReport(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status);
        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    public Report getById(Long reportId) {
        Report report = reportRepository.findById(reportId).orElseThrow();

        return report;
    }
}