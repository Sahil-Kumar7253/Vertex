package com.vertex.vertex_api.security;

public record AuthRequestDto(
        String email,
        String password
) {}
