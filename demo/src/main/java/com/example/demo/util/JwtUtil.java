package com.example.demo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor("YourSuperSecretKeyForJWTsMustBeAtLeast32BytesLong".getBytes()); // Use at least 32 bytes
    private final long EXPIRATION_TIME = 3600000; // 1 hour

    // 🔹 **Generate JWT Token**
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY) // ✅ Fixed
                .compact();
    }

    // 🔹 **Extract Email from Token**
    public String extractEmail(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY) // ✅ Fixed
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
}
    