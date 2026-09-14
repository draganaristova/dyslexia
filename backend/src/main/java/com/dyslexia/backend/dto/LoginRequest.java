package com.dyslexia.backend.dto;

public record LoginRequest(
    String email, String password
) {}
