package com.dyslexia.backend.dto;

public record LoginResponse(
        String token,
        Long userId,
        String name,
        String email
) {}