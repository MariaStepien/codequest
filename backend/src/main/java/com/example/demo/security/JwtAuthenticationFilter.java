// New File: src/main/java/com/example/demo/security/JwtAuthenticationFilter.java

package com.example.demo.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User; // Use Spring Security's User
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        Long userId = null;

        // Check if the header is present and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the token (skip "Bearer ")
        jwt = authHeader.substring(7);

        // 3. Validate and extract user ID from the token
        userId = jwtService.extractUserId(jwt);

        // 4. Set Authentication in Security Context
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Create a UserDetails object using the extracted userId.
            // Note: We use the userId as the username/principal here.
            User userDetails = new User(userId.toString(), "", Collections.emptyList());
            
            // Create an Authentication object
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, // This principal holds the userId
                    null,
                    userDetails.getAuthorities()
            );

            // Add request details
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set the Authentication in the Security Context
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}