package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain; // Import HttpMethod

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
            // 1. Disable CSRF (essential for stateless REST APIs)
            .csrf(csrf -> csrf.disable())

            // 2. Configure Session Management to be Stateless (standard for token-based auth)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 3. Configure authorization rules
            .authorizeHttpRequests(registry -> {
                // FIX: Explicitly permit OPTIONS requests for all paths (CORS preflight)
                registry.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                
                // Allow the login endpoint
                registry.requestMatchers("/api/auth/login").permitAll();
                
                // Allow the registration path
                registry.requestMatchers("api/auth/register").permitAll();

                // All other requests still require authentication
                registry.anyRequest().authenticated();
            })
            
            // Disable default form login configuration
            .formLogin(form -> form.disable())
            
            .build();
    }
}