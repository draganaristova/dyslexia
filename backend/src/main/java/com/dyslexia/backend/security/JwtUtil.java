package com.dyslexia.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;


    /*
     * Token важи 7 дена.
     */
    private static final long EXPIRATION_MS =
            1000L * 60 * 60 * 24 * 7;


    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                secret.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }


    /**
     * Креира JWT за конкретен user.
     */
    public String generateToken(
            Long userId
    ) {

        return Jwts.builder()

                /*
                 * subject = userId
                 */
                .subject(
                        String.valueOf(userId)
                )

                .issuedAt(
                        new Date()
                )

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_MS
                        )
                )

                .signWith(
                        getSigningKey()
                )

                .compact();
    }


    /**
     * Го чита userId од JWT.
     */
    public Long getUserIdFromToken(
            String token
    ) {

        String subject =
                Jwts.parser()

                        .verifyWith(
                                getSigningKey()
                        )

                        .build()

                        .parseSignedClaims(
                                token
                        )

                        .getPayload()

                        .getSubject();


        return Long.parseLong(
                subject
        );
    }
}