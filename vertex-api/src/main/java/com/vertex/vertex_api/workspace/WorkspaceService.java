package com.vertex.vertex_api.workspace;

import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.user.UserRepository;
import com.vertex.vertex_api.workspace.Entity.Workspace;
import com.vertex.vertex_api.workspace.Entity.WorkspaceMember;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository workspaceMemberRepository, UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
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

    @Transactional(readOnly = true)
    public List<WorkspaceResponseDto> getUserWorkspace(User user){
        return workspaceMemberRepository.findByUserId(user.getId())
                .stream()
                .map(member -> {
                    Workspace w = member.getWorkspace();
                    return new WorkspaceResponseDto(w.getId(), w.getName(), w.getOwner().getId(), w.getCreatedAt());
                }).collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceMemberResponseDto inviteMember(UUID workspaceId, MemberInviteRequestDto request, User currentUser) {
        // 1. Verify the current user is an ADMIN of this workspace
        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));

        if (currentMember.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only workspace ADMINs can invite new members");
        }

        // 2. Find the workspace
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 3. Find the user being invited
        User userToInvite = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User with this email does not exist"));

        // 4. Check if they are already in the workspace
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userToInvite.getId())) {
            throw new RuntimeException("User is already a member of this workspace");
        }

        // 5. Create and save the new member
        WorkspaceMember newMember = new WorkspaceMember(workspace, userToInvite, request.role());
        WorkspaceMember savedMember = workspaceMemberRepository.save(newMember);

        return new WorkspaceMemberResponseDto(
                savedMember.getId(),
                userToInvite.getId(),
                userToInvite.getEmail(), // Assuming your User entity has getEmail()
                savedMember.getRole()
        );
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponseDto> getWorkspaceMembers(UUID workspaceId, User currentUser) {
        // 1. Verify the current user is actually in this workspace before revealing members
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        // 2. Fetch and map members
        return workspaceMemberRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(member -> new WorkspaceMemberResponseDto(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getEmail(),
                        member.getRole()
                ))
                .collect(Collectors.toList());
    }
}