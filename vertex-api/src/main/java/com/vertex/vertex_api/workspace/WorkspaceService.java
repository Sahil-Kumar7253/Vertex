package com.vertex.vertex_api.workspace;

import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.workspace.Entity.Workspace;
import com.vertex.vertex_api.workspace.Entity.WorkspaceMember;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository workspaceMemberRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    @Transactional
    public WorkspaceResponseDto createWorkspace(WorkspaceRequestDto request, User owner) {
        Workspace workspace = new Workspace(request.name(), owner);
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember(savedWorkspace, owner, Role.ADMIN);
        workspaceMemberRepository.save(member);

        return new WorkspaceResponseDto(
                savedWorkspace.getId(),
                savedWorkspace.getName(),
                owner.getId(),
                savedWorkspace.getCreatedAt()
        );
    }

    public List<WorkspaceResponseDto> getUserWorkspace(User user){
        return workspaceMemberRepository.findByUserId(user.getId())
                .stream()
                .map(member -> {
                    Workspace w = member.getWorkspace();
                    return new WorkspaceResponseDto(w.getId(), w.getName(), w.getOwner().getId(), w.getCreatedAt());
                }).collect(Collectors.toList());
    }
}
