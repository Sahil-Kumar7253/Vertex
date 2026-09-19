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

        WorkspaceMember member = new WorkspaceMember(savedWorkspace, owner, Role.ADMIN, MemberStatus.ACCEPTED);
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
                .filter(member -> member.getStatus() == MemberStatus.ACCEPTED)
                .map(member -> {
                    Workspace w = member.getWorkspace();
                    return new WorkspaceResponseDto(w.getId(), w.getName(), w.getOwner().getId(), w.getCreatedAt());
                }).collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceMemberResponseDto inviteMember(UUID workspaceId, MemberInviteRequestDto request, User currentUser) {
        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));

        if (currentMember.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only workspace ADMINs can invite new members");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User userToInvite = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User with this email does not exist"));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userToInvite.getId())) {
            throw new RuntimeException("User is already in this workspace or has a pending invite");
        }

        // Invited members start as PENDING
        WorkspaceMember newMember = new WorkspaceMember(workspace, userToInvite, request.role(), MemberStatus.PENDING);
        WorkspaceMember savedMember = workspaceMemberRepository.save(newMember);

        return new WorkspaceMemberResponseDto(
                savedMember.getId(),
                userToInvite.getId(),
                userToInvite.getEmail(),
                savedMember.getRole(),
                savedMember.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponseDto> getWorkspaceMembers(UUID workspaceId, User currentUser) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        return workspaceMemberRepository.findByWorkspaceId(workspaceId, MemberStatus.ACCEPTED)
                .stream()
                .map(member -> new WorkspaceMemberResponseDto(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getEmail(),
                        member.getRole(),
                        member.getStatus()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponseDto> getPendingInvites(User user) {
        return workspaceMemberRepository.findPendingInvitesByUserId(user.getId(), MemberStatus.PENDING)
                .stream()
                .map(member -> {
                    Workspace w = member.getWorkspace();
                    return new WorkspaceResponseDto(w.getId(), w.getName(), w.getOwner().getId(), w.getCreatedAt());
                }).collect(Collectors.toList());
    }

    @Transactional
    public void acceptInvite(UUID workspaceId, User user) {
        WorkspaceMember pendingMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (pendingMember.getStatus() == MemberStatus.ACCEPTED) {
            throw new RuntimeException("Invite already accepted");
        }

        pendingMember.setStatus(MemberStatus.ACCEPTED);
        workspaceMemberRepository.save(pendingMember);
    }

    @Transactional
    public void rejectInvite(UUID workspaceId, User user) {
        WorkspaceMember pendingMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (pendingMember.getStatus() == MemberStatus.ACCEPTED) {
            throw new RuntimeException("Cannot reject an already accepted invite. You must leave the workspace instead.");
        }

        workspaceMemberRepository.delete(pendingMember);
    }
}