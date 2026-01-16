package com.codequest.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.domain.Comment;
import com.codequest.demo.domain.Post;
import com.codequest.demo.domain.User;
import com.codequest.demo.repos.CommentRepository;
import com.codequest.demo.repos.PostRepository;
import com.codequest.demo.repos.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Post createPost(Long authorId, Post post) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uzytkownika o id: " + authorId));
        post.setAuthor(author);
        post.setEdited(false);
        return postRepository.save(post);
    }

    public void deletePost(Long postId, Long userId, boolean isAdmin) {
        Post post = postRepository.findById(postId).orElseThrow();
        if (isAdmin || (post.getAuthor() != null && Objects.equals(post.getAuthor().getId(), userId))) {
            postRepository.delete(post);
        }
    }

    @Transactional
    public Comment addComment(Long authorId, Long postId, Comment comment) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uzytkownika o id: " + authorId));
        
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setEdited(false);
        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (isAdmin || (comment.getAuthor() != null && Objects.equals(comment.getAuthor().getId(), userId))) {
            commentRepository.delete(comment);
        } else {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
    }

    @Transactional
    public Post updatePost(Long postId, Long userId, Post postDetails) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getAuthor() == null || !Objects.equals(post.getAuthor().getId(), userId)) {
            throw new RuntimeException("Unauthorized to edit this post");
        }

        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setEdited(true);
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    @Transactional
    public Comment updateComment(Long commentId, Long userId, Comment commentDetails) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (comment.getAuthor() == null || !Objects.equals(comment.getAuthor().getId(), userId)) {
            throw new RuntimeException("Unauthorized to edit this comment");
        }

        comment.setContent(commentDetails.getContent());
        comment.setEdited(true);
        comment.setUpdatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @Transactional
    public Comment addReply(Long authorId, Long postId, Long parentCommentId, Comment reply) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));

        reply.setPost(post);
        reply.setAuthor(author);
        reply.setIsReply(true);
        reply.setParentComment(parentComment);
        reply.setEdited(false);
        
        return commentRepository.save(reply);
    }
}