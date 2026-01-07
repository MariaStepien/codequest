package com.example.demo.repos;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.Report;
import com.example.demo.domain.ReportStatus;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(ReportStatus status, Sort sort);
    List<Report> findByTargetType(String targetType, Sort sort);
    List<Report> findByStatusAndTargetType(ReportStatus status, String targetType, Sort sort);
    List<Report> findAll(Sort sort);

}
