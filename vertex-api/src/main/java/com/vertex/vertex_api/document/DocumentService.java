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

    public DocumentResponseDto getDocumentById(UUID workspaceId, UUID documentId){
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        if(!document.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Document does not belong to this workspace");
        }

        return mapToDto(document);
    }

    public DocumentResponseDto updateDocument(UUID workspaceId, UUID documentId, DocumentRequestDto request){
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
