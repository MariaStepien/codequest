package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(registry -> {
                registry.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                
                registry.requestMatchers("/api/admin/**").hasRole("ADMIN"); 

                registry.requestMatchers("/api/courses/create-course").hasRole("ADMIN");
                
                registry.requestMatchers("/api/lessons/**").permitAll();

                // Allow the login endpoint
                registry.requestMatchers("/api/auth/login").permitAll();
                
                // Allow the registration path
                registry.requestMatchers("/api/auth/register").permitAll();

                registry.requestMatchers("/api/courses").permitAll();

                registry.requestMatchers("/api/user/me").permitAll();

                registry.requestMatchers("/api/courses/**").permitAll();

                registry.requestMatchers("/api/progress/update").permitAll();

                registry.requestMatchers("/api/courses/with-progress").permitAll();

                registry.requestMatchers("/api/progress/latest-activity").permitAll();
                
                registry.requestMatchers("/api/courses/completed-levels/**").permitAll();

                registry.requestMatchers("/api/courses/published").hasRole("ADMIN");

                registry.requestMatchers("/api/courses/unpublished").hasRole("ADMIN");

                registry.requestMatchers("/api/courses/{id}").hasRole("ADMIN");

                registry.requestMatchers("/api/lessons/create").hasRole("ADMIN");

                registry.requestMatchers("/api/lessons/course/{courseId}").hasRole("ADMIN");

                // All other requests still require authentication
                registry.anyRequest().authenticated();
            })
            
            .formLogin(form -> form.disable())
            
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) 
            
            .build();
    }
}