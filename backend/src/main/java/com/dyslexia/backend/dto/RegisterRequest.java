package com.dyslexia.backend.dto;

public record RegisterRequest(
    String name, String surname, Integer age,
    String email, String password, String repeatpassword, String gender
) {}
