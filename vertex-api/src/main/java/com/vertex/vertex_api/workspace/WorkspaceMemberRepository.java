package com.vertex.vertex_api.workspace;

import com.vertex.vertex_api.workspace.Entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {

    @Query("SELECT wm FROM WorkspaceMember wm " +
            "JOIN FETCH wm.workspace w " +
            "JOIN FETCH w.owner " +
            "WHERE wm.user.id = :userId")
    List<WorkspaceMember> findByUserId(@Param("userId") UUID userId);

    java.util.Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    @Query("SELECT wm FROM WorkspaceMember wm JOIN FETCH wm.user WHERE wm.workspace.id = :workspaceId")
    List<WorkspaceMember> findByWorkspaceId(@Param("workspaceId") UUID workspaceId);
}

