package com.vertex.vertex_api.document;


import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.workspace.Entity.Workspace;
import com.vertex.vertex_api.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final WorkspaceRepository workspaceRepository;

    public DocumentService(DocumentRepository documentRepository, WorkspaceRepository workspaceRepository) {
        this.documentRepository = documentRepository;
        this.workspaceRepository = workspaceRepository;
    }

    public DocumentResponseDto createDocument(UUID workspaceId, DocumentRequestDto request, User creator) {
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

    public List<DocumentResponseDto> getDocumentByWorkspace(UUID workspaceId){
        return documentRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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
