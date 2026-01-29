package com.codequest.demo.service;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // Inject secret key from application properties for security
    @Value("${jwt.secret:QWxhZGRpbjpvcGVuIHNlc2FtZQo}")
    private String secretKey; 
    
    // Inject expiration time
    @Value("${jwt.expiration.ms:86400000}")
    private long expirationTimeMs;

    /**
     * Creates and signs a real JWT with the User ID as the subject.
     * @param userId The ID of the authenticated user to be included in the token.
     * @return The signed JWT string.
     */
    public String generateToken(Long userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTimeMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the User ID (subject) from a real JWT.
     * This method implicitly validates the token's signature and expiration.
     * @param token The JWT string provided by the client.
     * @return The userId (Long) or throws an exception if the token is invalid/expired.
     */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        String userIdStr = claims.getSubject();

        if (userIdStr != null) {
            try {
                return Long.valueOf(userIdStr);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token) // This method validates the signature and expiration
                .getBody();
    }
    
    /**
     * Converts the Base64-encoded secret key string into a usable Key object.
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}