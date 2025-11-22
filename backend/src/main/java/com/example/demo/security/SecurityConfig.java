package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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

                // All other requests still require authentication
                registry.anyRequest().authenticated();
            })
            
            .formLogin(form -> form.disable())
            
            .build();
    }
}