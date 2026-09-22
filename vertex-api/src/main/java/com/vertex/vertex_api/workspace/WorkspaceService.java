package com.vertex.vertex_api.workspace;

import com.vertex.vertex_api.document.Document;
import com.vertex.vertex_api.document.DocumentRepository;
import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.user.UserRepository;
import com.vertex.vertex_api.workspace.Entity.Workspace;
import com.vertex.vertex_api.workspace.Entity.WorkspaceMember;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository workspaceMemberRepository, UserRepository userRepository, DocumentRepository documentRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.documentRepository = documentRepository;
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
                savedWorkspace.getCreatedAt(),
                Role.ADMIN
        );
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponseDto> getUserWorkspace(User user){
        return workspaceMemberRepository.findByUserId(user.getId())
                .stream()
                .filter(member -> member.getStatus() == MemberStatus.ACCEPTED)
                .map(member -> {
                    Workspace w = member.getWorkspace();
                    return new WorkspaceResponseDto(w.getId(), w.getName(), w.getOwner().getId(), w.getCreatedAt(), member.getRole());
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
                    return new WorkspaceResponseDto(w.getId(), w.getName(), w.getOwner().getId(), w.getCreatedAt(), member.getRole());
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

    @Transactional
    public void leaveWorkspace(UUID workspaceId, User currentUser) {
        // 1. Find the workspace
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 2. Prevent the owner from leaving
        if (workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("The owner cannot leave the workspace. You must delete the workspace instead.");
        }

        // 3. Find the membership record
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));

        // 4. Delete the membership
        workspaceMemberRepository.delete(member);
    }

    @Transactional
    public void deleteWorkspace(UUID workspaceId, User currentUser) {
        // 1. Find the workspace
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 2. Prevent non-owners from deleting
        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the workspace owner can delete it.");
        }

        List<Document> documents = documentRepository.findByWorkspaceId(workspaceId);
        documentRepository.deleteAll(documents);

        // 3. Delete all membership records tied to this workspace first
        List<MemberStatus> statuses = Arrays.asList(MemberStatus.values());
        for (MemberStatus memberStatus : statuses) {
            List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId, memberStatus);
            workspaceMemberRepository.deleteAll(members);
        }
        // 4. Delete the workspace itself
        workspaceRepository.delete(workspace);
    }
}