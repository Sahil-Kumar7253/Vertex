package com.vertex.vertex_api.security;

public record RegisterRequestDto(
        String name,
        String email,
        String password
) {}
