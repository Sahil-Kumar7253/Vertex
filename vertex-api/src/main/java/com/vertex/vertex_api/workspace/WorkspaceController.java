package com.vertex.vertex_api.workspace;

import com.vertex.vertex_api.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponseDto> createWorkspace(
            @RequestBody WorkspaceRequestDto request,
            @AuthenticationPrincipal User currentUser
    ){
        return ResponseEntity.ok(workspaceService.createWorkspace(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponseDto>> getWorkspace(
            @AuthenticationPrincipal User currentUser
    ){
        return ResponseEntity.ok(workspaceService.getUserWorkspace(currentUser));
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMemberResponseDto> inviteMember(
            @PathVariable UUID workspaceId,
            @RequestBody MemberInviteRequestDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(workspaceService.inviteMember(workspaceId, request, currentUser));
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMemberResponseDto>> getWorkspaceMembers(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(workspaceService.getWorkspaceMembers(workspaceId, currentUser));
    }

    @GetMapping("/invites")
    public ResponseEntity<List<WorkspaceResponseDto>> getPendingInvites(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(workspaceService.getPendingInvites(currentUser));
    }

    @PostMapping("/{workspaceId}/invites/accept")
    public ResponseEntity<Void> acceptInvite(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User currentUser
    ) {
        workspaceService.acceptInvite(workspaceId, currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workspaceId}/invites/reject")
    public ResponseEntity<Void> rejectInvite(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User currentUser
    ) {
        workspaceService.rejectInvite(workspaceId, currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workspaceId}/leave")
    public ResponseEntity<Void> leaveWorkspace(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User currentUser
    ) {
        workspaceService.leaveWorkspace(workspaceId, currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User currentUser
    ) {
        workspaceService.deleteWorkspace(workspaceId, currentUser);
        return ResponseEntity.ok().build();
    }
}
