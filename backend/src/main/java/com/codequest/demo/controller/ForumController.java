package com.codequest.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codequest.demo.domain.Comment;
import com.codequest.demo.domain.Post;
import com.codequest.demo.service.ForumService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/posts")
    public ResponseEntity<Page<Post>> getAllPosts(@PageableDefault(size = 10, sort = "id", direction= Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(forumService.getAllPosts(pageable));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getPostById(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestParam Long authorId, @RequestBody Post post) {
        return ResponseEntity.ok(forumService.createPost(authorId, post));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @RequestParam Long userId, @RequestParam boolean isAdmin) {
        forumService.deletePost(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> addComment(@RequestParam Long authorId, @PathVariable Long postId, @RequestBody Comment comment) {
        return ResponseEntity.ok(forumService.addComment(authorId, postId, comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @RequestParam Long userId, @RequestParam boolean isAdmin) {
        forumService.deleteComment(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestParam Long userId, @RequestBody Post post) {
        return ResponseEntity.ok(forumService.updatePost(id, userId, post));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestParam Long userId, @RequestBody Comment comment) {
        return ResponseEntity.ok(forumService.updateComment(id, userId, comment));
    }

    @PostMapping("/posts/{postId}/comments/{parentCommentId}/replies")
    public ResponseEntity<Comment> addReply(
            @RequestParam Long authorId, 
            @PathVariable Long postId, 
            @PathVariable Long parentCommentId, 
            @RequestBody Comment reply) {
        return ResponseEntity.ok(forumService.addReply(authorId, postId, parentCommentId, reply));
    }
}