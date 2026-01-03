package com.example.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
}