package com.codequest.demo.security;

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
                
                registry.requestMatchers("/api/auth/login").permitAll();
                registry.requestMatchers("/api/auth/register").permitAll();

                registry.requestMatchers("/api/courses/{id}").permitAll();
                registry.requestMatchers("/api/courses/with-progress").permitAll();
                registry.requestMatchers("/api/courses/completed-levels/**").permitAll();
                registry.requestMatchers("/api/courses").hasRole("ADMIN");
                registry.requestMatchers("/api/courses/create-course").hasRole("ADMIN");
                registry.requestMatchers("/api/courses/published").hasRole("ADMIN");
                registry.requestMatchers("/api/courses/unpublished").hasRole("ADMIN");
                registry.requestMatchers("/api/courses/{id}/**").hasRole("ADMIN");

                registry.requestMatchers(HttpMethod.GET,"/api/lessons/{lessonId}").permitAll();
                registry.requestMatchers(HttpMethod.GET,"/api/lessons/course/{courseId}/order/{orderIndex}").permitAll();
                registry.requestMatchers("/api/lessons/create").hasRole("ADMIN");
                registry.requestMatchers("/api/lessons/course/{courseId}").hasRole("ADMIN");
                registry.requestMatchers("/api/lessons/course/{courseId}/next-order").hasRole("ADMIN");
                registry.requestMatchers(HttpMethod.PUT, "/api/lessons/{lessonId}").hasRole("ADMIN");
                registry.requestMatchers(HttpMethod.DELETE, "/api/lessons/{lessonId}").hasRole("ADMIN");

                registry.requestMatchers("/api/progress/update").permitAll();
                registry.requestMatchers("/api/progress/latest-activity").permitAll();
                registry.requestMatchers("/api/lesson-progress/**").permitAll();
                registry.requestMatchers("/api/progress/list-users/**").hasRole("ADMIN");

                registry.requestMatchers("/api/user/me").permitAll();
                registry.requestMatchers("/api/user/change-password").authenticated();
                registry.requestMatchers("/api/user/consume-heart").permitAll();
                registry.requestMatchers("/api/user/buy-heart").permitAll();
                registry.requestMatchers("/api/user/all").hasRole("ADMIN");
                registry.requestMatchers("/api/user/{id}/toggle-block").hasRole("ADMIN");
                registry.requestMatchers("/api/user/{id}/block-user").hasRole("ADMIN");

                registry.requestMatchers("/api/user-equipment/**").permitAll();
                registry.requestMatchers("/api/user-bought-equipment/**").permitAll();
                registry.requestMatchers(HttpMethod.GET, "/api/equipment/{id}").permitAll();
                registry.requestMatchers(HttpMethod.GET, "/api/equipment/type/{type}").permitAll();
                registry.requestMatchers("/api/equipment/admin/**").hasRole("ADMIN");
                registry.requestMatchers("/api/equipment/**").hasRole("ADMIN");

                registry.requestMatchers(HttpMethod.GET,"/api/enemies/{id}").permitAll();
                registry.requestMatchers("/api/enemies/**").hasRole("ADMIN");

                registry.requestMatchers("/api/ranking/global").permitAll();
                registry.requestMatchers("/api/ranking/me").authenticated();

                registry.requestMatchers("/api/forum").permitAll();
                registry.requestMatchers("/api/forum/**").permitAll();

                registry.requestMatchers(HttpMethod.POST,"/api/reports").permitAll();
                registry.requestMatchers("/api/reports/**").hasRole("ADMIN");

                registry.requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll();
                registry.requestMatchers("/api/uploads/**").hasRole("ADMIN");

                registry.requestMatchers("/api/sprites/upload").hasRole("ADMIN");

                registry.anyRequest().authenticated();
            })
            .formLogin(form -> form.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) 
            .build();
    }
}