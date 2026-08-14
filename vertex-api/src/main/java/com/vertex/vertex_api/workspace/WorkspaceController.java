package com.vertex.vertex_api.workspace;

import com.vertex.vertex_api.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
