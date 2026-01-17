package com.codequest.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.domain.Report;
import com.codequest.demo.domain.ReportStatus;
import com.codequest.demo.domain.User;
import com.codequest.demo.repos.ReportRepository;
import com.codequest.demo.repos.UserRepository;

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

    public long getDailyReportCount() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return reportRepository.countByCreatedAtAfter(startOfDay);
    }

    public long getPendingReportCount() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }
}