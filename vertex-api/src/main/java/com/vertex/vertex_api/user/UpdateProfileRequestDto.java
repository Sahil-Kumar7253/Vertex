package com.vertex.vertex_api.user;

public record UpdateProfileRequestDto(
        String name,
        String currentPassword,
        String newPassword
) {}
