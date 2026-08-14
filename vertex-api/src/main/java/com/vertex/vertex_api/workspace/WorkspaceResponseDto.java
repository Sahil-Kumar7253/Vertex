package com.vertex.vertex_api.workspace;

import java.time.LocalDateTime;
import java.util.UUID;

public record WorkspaceResponseDto(
        UUID id,
        String name,
        UUID ownerId,
        LocalDateTime createdAt
) {}
