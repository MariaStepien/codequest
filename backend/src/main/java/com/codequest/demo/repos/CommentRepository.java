package com.codequest.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codequest.demo.domain.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
}