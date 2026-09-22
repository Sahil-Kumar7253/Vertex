package com.vertex.vertex_api.document;


import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.workspace.Entity.Workspace;
import com.vertex.vertex_api.workspace.Entity.WorkspaceMember;
import com.vertex.vertex_api.workspace.MemberStatus;
import com.vertex.vertex_api.workspace.Role;
import com.vertex.vertex_api.workspace.WorkspaceMemberRepository;
import com.vertex.vertex_api.workspace.WorkspaceRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public DocumentService(DocumentRepository documentRepository, WorkspaceRepository workspaceRepository, WorkspaceMemberRepository workspaceMemberRepository) {
        this.documentRepository = documentRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    private WorkspaceMember validateAccess(UUID workspaceId, User user, boolean requireWriteAccess) {
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() -> new RuntimeException("Access denied: You are not a member of this workspace"));

        if (member.getStatus() != MemberStatus.ACCEPTED) {
            throw new RuntimeException("Access denied: You must accept the invite first.");
        }

        if (requireWriteAccess && member.getRole() == Role.VIEWER) {
            throw new RuntimeException("Access denied: VIEWERS cannot modify documents.");
        }

        return member;
    }

    public DocumentResponseDto createDocument(UUID workspaceId, DocumentRequestDto request, User creator) {
        validateAccess(workspaceId, creator, true);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        Document document = new Document(
                request.title(),
                request.content() != null ? request.content() : "",
                workspace,
                creator
        );

        Document savedDocument = documentRepository.save(document);
        return mapToDto(savedDocument);
    }

    public List<DocumentResponseDto> getDocumentByWorkspace(UUID workspaceId, User currentUser){
        validateAccess(workspaceId, currentUser, false);

        return documentRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DocumentResponseDto getDocumentById(UUID workspaceId, UUID documentId, User currentUser){
        validateAccess(workspaceId, currentUser, false);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        if(!document.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Document does not belong to this workspace");
        }

        return mapToDto(document);
    }

    public DocumentResponseDto updateDocument(UUID workspaceId, UUID documentId, DocumentRequestDto request, User currentUser){
        validateAccess(workspaceId, currentUser, false);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        if(!document.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Document does not belong to this workspace");
        }

        if(request.title() != null && !request.title().trim().isEmpty()) {
            document.setTitle(request.title());
        }
        if(request.content() != null){
            document.setContent(request.content());
        }

        Document updatedDocument = documentRepository.save(document);
        return mapToDto(updatedDocument);
    }

    @Transactional
    public void deleteDocument(UUID workspaceId, UUID documentId, User currentUser) {
        // 1. Verify the user is an ADMIN or EDITOR
        validateAccess(workspaceId, currentUser, true);

        // 2. Find the document
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // 3. Ensure it actually belongs to this workspace
        if(!document.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Document does not belong to this workspace");
        }

        // 4. Delete it
        documentRepository.delete(document);
    }

    private DocumentResponseDto mapToDto(Document document){
        return new DocumentResponseDto(
                document.getId(),
                document.getTitle(),
                document.getContent(),
                document.getWorkspace().getId(),
                document.getCreator().getId(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
