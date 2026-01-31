package com.codequest.demo.service;

import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codequest.demo.model.Comment;
import com.codequest.demo.model.Post;
import com.codequest.demo.model.User;
import com.codequest.demo.repository.CommentRepository;
import com.codequest.demo.repository.PostRepository;
import com.codequest.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    /**
     * Gets all posts as pages (10 records per page)
     * @param pageable
     * @return page of posts
     */
    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Finds post by id.
     * @param id post id.
     * @return post
     * @throws IllegalArgumentException if no post id was given.
     * @throws RuntimeException if no post was found.
     */
    @Transactional(readOnly = true)
    public Post getPostById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono wpisu."));
    }

    /**
     * Creates a post
     * @param authorId id of creator of post
     * @param post post object that will be created
     * @return post
     */
    public Post createPost(Long authorId, Post post) {
        if (authorId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }

        if (post.getTitle().length() > 255) {
            throw new IllegalArgumentException("Tytuł wpisu nie może być dłuższy niż 255 znaków.");
        }

        if (post.getContent().length() > 2000) {
            throw new IllegalArgumentException("Treść wpisu nie nie może być dłuższa niż 2000 znaków.");
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uzytkownika o id: " + authorId));
        post.setAuthor(author);
        post.setEdited(false);
        return postRepository.save(post);
    }

    /**
     * Deletes a post
     * @param postId id of post to be deleted
     * @param userId id of user that will delete the post
     * @param isAdmin stores information whether admin is the one trying to delete post (admin can delete all posts)
     * @throws IllegalArgumentException when no postId or userId was given
     * @throws RuntimeException if no post was found.
     */
    public void deletePost(Long postId, Long userId, boolean isAdmin) {
        if (postId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        if (userId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Nie znaleziono wpisu."));
        if (isAdmin || (post.getAuthor() != null && Objects.equals(post.getAuthor().getId(), userId))) {
            postRepository.delete(post);
        }
    }
    
    /**
     * Adds a comment made by user
     * @param postId id of post that will be commented
     * @param authorId id of user creating comment
     * @param Comment object Comment that stores all information about the comment
     * @return created comment
     * @throws IllegalArgumentException when no postId or authorId was given
     * @throws RuntimeException if no post or user was found.
     */
    @Transactional
    public Comment addComment(Long authorId, Long postId, Comment comment) {
        if (authorId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        if (postId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        if (comment.getContent().length() > 500) {
            throw new IllegalArgumentException("Treść wpisu nie może być dłuższa niż 500 znaków.");
        }
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono wpisu."));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uzytkownika o id: " + authorId));
        
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setEdited(false);
        return commentRepository.save(comment);
    }

    /**
     * Gets comment by id
     * @param id comment id
     * @return Comment object
     * @throws IllegalArgumentException when id was given
     * @throws RuntimeException if comment was found.
     */
    @Transactional(readOnly = true)
    public Comment getCommentById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono komentarza."));
    }

    /**
     * Deletes a comment
     * @param comment id of comment to be deleted
     * @param userId id of user that will delete the comment
     * @param isAdmin stores information whether admin is the one trying to delete comment (admin can delete all comments)
     * @throws IllegalArgumentException when no commentId or userId was given
     * @throws RuntimeException if no coments was found.
     */
    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        if (commentId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono komentarza."));
        
        if (isAdmin || (comment.getAuthor() != null && Objects.equals(comment.getAuthor().getId(), userId))) {
            commentRepository.delete(comment);
        } else {
            throw new RuntimeException("Brak uprawnień do usunięcia tego komentarza.");
        }
    }

    /**
     * Updates a post
     * @param postId id of post to be updated
     * @param userId id of user that will update the post
     * @param Post object that will be updated
     * @throws IllegalArgumentException when no postId or userId was given
     * @throws RuntimeException if no post was found.
     */
    @Transactional
    public Post updatePost(Long postId, Long userId, Post postDetails) {
        if (postId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono wpisu."));

        if (post.getAuthor() == null || !Objects.equals(post.getAuthor().getId(), userId)) {
            throw new RuntimeException("Brak uprawnień do edycji wpisu.");
        }

        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setEdited(true);

        return postRepository.save(post);
    }
   
    /**
     * Updates a comment
     * @param commentId id of comment to be updated
     * @param userId id of user that will update the comment
     * @param Comment object that will be updated
     * @throws IllegalArgumentException when no commentId or userId was given
     * @throws RuntimeException if no comment was found.
     */
    @Transactional
    public Comment updateComment(Long commentId, Long userId, Comment commentDetails) {
        if (commentId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono komentarza."));

        if (comment.getAuthor() == null || !Objects.equals(comment.getAuthor().getId(), userId)) {
            throw new RuntimeException("Brak uprawnień do edycji komentarza.");
        }

        comment.setContent(commentDetails.getContent());
        comment.setEdited(true);

        return commentRepository.save(comment);
    }

    /**
     * Creates a reply to a comment
     * @param postId id of post that reply to comment will be made on
     * @param authorId id of user that will add reply to another comment
     * @param parentCommentId id of comment that will replied to
     * @param reply object that will be created
     * @throws IllegalArgumentException when no postId, authorId or parentCommentId was given
     * @throws RuntimeException if no post, user or parent comment was found.
     */
    @Transactional
    public Comment addReply(Long authorId, Long postId, Long parentCommentId, Comment reply) {
        if (postId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        if (authorId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        if (parentCommentId == null) {
            throw new IllegalArgumentException("Coś poszło nie tak. Spróbuj ponownie później.");
        }
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono wpisu"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
        
        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono komentarza nadrzędnego."));

        reply.setPost(post);
        reply.setAuthor(author);
        reply.setIsReply(true);
        reply.setParentComment(parentComment);
        reply.setEdited(false);
        
        return commentRepository.save(reply);
    }
}