package com.codequest.demo.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.model.Report;
import com.codequest.demo.model.ReportStatus;
import com.codequest.demo.model.User;
import com.codequest.demo.repository.ReportRepository;
import com.codequest.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new report
     * @param reporterId id of the user creating the report
     * @param report report object to be saved
     * @return created report
     * @throws IllegalArgumentException if no reporterId was given
     * @throws RuntimeException if reporter user was not found
     */
    public Report createReport(Long reporterId, Report report) {
        if (reporterId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony."));
        
        report.setReporter(reporter);
        report.setStatus(ReportStatus.PENDING);
        return reportRepository.save(report);
    }

    /**
     * Gets reports filtered by status and target type with pagination
     * @param status report status filter (or "ALL")
     * @param targetType type of reported entity (or "ALL")
     * @param pageable pagination information
     * @return page of filtered reports
     */
    public Page<Report> getFilteredReports(String status, String targetType, Pageable pageable) {
        boolean statusAll = (status == null || status.equals("ALL"));
        boolean targetTypeAll = (targetType == null || targetType.equals("ALL"));

        if (statusAll && targetTypeAll) {
            return reportRepository.findAll(pageable);
        } else if (!statusAll && targetTypeAll) {
            return reportRepository.findByStatus(ReportStatus.valueOf(status), pageable);
        } else if (statusAll && !targetTypeAll) {
            return reportRepository.findByTargetType(targetType, pageable);
        } else {
            return reportRepository.findByStatusAndTargetType(ReportStatus.valueOf(status), targetType, pageable);
        }
    }

    /**
     * Updates the status of a report to resolve it
     * @param reportId id of the report to be resolved
     * @param status new status to be set
     * @throws IllegalArgumentException if no reportId was given
     * @throws RuntimeException if report was not found
     */
    @Transactional
    public void resolveReport(Long reportId, ReportStatus status) {
        if (reportId == null) {
            throw new IllegalArgumentException("Brak id zgłaszającego");
        }
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Zgłoszenie nieznalezione."));
        
        report.setStatus(status);
        reportRepository.save(report);
    }

    /**
     * Gets report by id
     * @param reportId id of the report
     * @return found report
     * @throws IllegalArgumentException if no reportId was given
     * @throws NoSuchElementException if report was not found
     */
    public Report getById(Long reportId) {
        if (reportId == null) {
            throw new IllegalArgumentException("Brak id zgłaszającego");
        }
        Report report = reportRepository.findById(reportId).orElseThrow();

        return report;
    }

    /**
     * Calculates the number of reports created since the beginning of the current day
     * @return count of daily reports
     */
    public long getDailyReportCount() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return reportRepository.countByCreatedAtAfter(startOfDay);
    }

    /**
     * Gets the total number of reports with PENDING status
     * @return count of pending reports
     */
    public long getPendingReportCount() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }
}