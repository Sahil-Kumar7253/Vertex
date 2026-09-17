package com.vertex.vertex_api.workspace;

public record MemberInviteRequestDto(
        String email,
        Role role
) {
}
