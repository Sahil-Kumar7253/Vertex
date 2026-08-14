package com.vertex.vertex_api.user;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDto(
    UUID id,
    String email,
    String name,
    LocalDateTime createdAt
){}
