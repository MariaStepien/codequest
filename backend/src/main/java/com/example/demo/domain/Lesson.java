package com.example.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table
@Data
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "tasks_json", columnDefinition = "TEXT")
    private String tasksJson;

    @Column(name = "has_enemy", nullable = false, columnDefinition = "boolean default false")
    private boolean hasEnemy = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enemy_id")
    private Enemy enemy;

    @Column(name = "background_img_source")
    private String backgroundImage;
}