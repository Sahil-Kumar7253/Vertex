package com.vertex.vertex_api.workspace;

import java.util.UUID;

public record WorkspaceMemberResponseDto(
        UUID memberId,
        UUID userId,
        String email,
        Role role
) {
}
