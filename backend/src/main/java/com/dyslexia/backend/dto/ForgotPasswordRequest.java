package com.dyslexia.backend.dto;

public record ForgotPasswordRequest(
        String email,
        String password,
        String repeatpassword
) {}