package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // <--- NEW IMPORT

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    // --- NEW FIELD & CONSTRUCTOR INJECTION ---
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    // ------------------------------------------

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(registry -> {
                registry.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                
                registry.requestMatchers("/api/lessons/**").permitAll();

                // Allow the login endpoint
                registry.requestMatchers("/api/auth/login").permitAll();
                
                // Allow the registration path
                registry.requestMatchers("/api/auth/register").permitAll();

                registry.requestMatchers("/api/courses").permitAll();

                registry.requestMatchers("/api/courses/**").permitAll();

                registry.requestMatchers("/api/progress/update").permitAll();

                registry.requestMatchers("/api/courses/with-progress").permitAll();

                // All other requests still require authentication
                registry.anyRequest().authenticated();
            })
            
            .formLogin(form -> form.disable())
            
            // --- NEW: Add the JWT filter BEFORE the standard authentication filter ---
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) 
            
            .build();
    }
}