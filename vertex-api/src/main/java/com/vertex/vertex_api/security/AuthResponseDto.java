package com.vertex.vertex_api.security;

import com.vertex.vertex_api.user.UserResponseDto;

public record AuthResponseDto(
        String token,
        UserResponseDto user
) {}
