package com.civicissues.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Get signing key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secret.getBytes()
        );
    }

    // Generate JWT token
    public String generateToken(
            String email,
            String role,
            Long userId) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date(
                        System.currentTimeMillis()
                ))
                .expiration(new Date(
                        System.currentTimeMillis()
                                + expiration
                ))
                .signWith(getSigningKey())
                .compact();
    }

    // Extract email
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Extract role
    public String extractRole(String token) {
        return (String) extractAllClaims(token)
                .get("role");
    }

    // Extract userId
    public Long extractUserId(String token) {
        Object userId = extractAllClaims(token)
                .get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        return (Long) userId;
    }

    // Extract expiration
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    // Check expired
    public boolean isTokenExpired(String token) {
        return extractExpiration(token)
                .before(new Date());
    }

    // Validate token
    public boolean validateToken(
            String token, String email) {
        try {
            String extractedEmail = extractEmail(token);
            return extractedEmail.equals(email)
                    && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Validate token only
    public boolean isValidToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException
                 | IllegalArgumentException e) {
            return false;
        }
    }
}