package com.codequest.demo.repos;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.domain.Report;
import com.codequest.demo.domain.ReportStatus;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    Page<Report> findByTargetType(String targetType, Pageable pageable);
    Page<Report> findByStatusAndTargetType(ReportStatus status, String targetType, Pageable pageable);
    Page<Report> findAll(Pageable pageable);
    long countByCreatedAtAfter(LocalDateTime dateTime);
    long countByStatus(ReportStatus status);
}
