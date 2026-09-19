package com.vertex.vertex_api.workspace.Entity;


import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.workspace.MemberStatus;
import com.vertex.vertex_api.workspace.Role;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(
        name = "workspace_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "user_id"})
)
public class WorkspaceMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MemberStatus status;

    public WorkspaceMember() {}

    public WorkspaceMember(Workspace workspace, User userToInvite, Role role, MemberStatus status) {
        this.workspace = workspace;
        this.user = userToInvite;
        this.role = role;
        this.status = status;
    }


    public WorkspaceMember(Workspace workspace, User user, Role role) {
        this(workspace, user, role, MemberStatus.ACCEPTED);
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }
}
