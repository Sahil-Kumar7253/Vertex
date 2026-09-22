package com.vertex.vertex_api.document;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.vertex.vertex_api.user.User;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService){
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<DocumentResponseDto> createDocument(
        @PathVariable UUID workspaceId,
        @RequestBody DocumentRequestDto request,
        @AuthenticationPrincipal User currentUser
    ){
        return ResponseEntity.ok(documentService.createDocument(workspaceId,request,currentUser));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponseDto>> getDocument(
        @PathVariable UUID workspaceId,
        @AuthenticationPrincipal User currentUser
    ){
        return ResponseEntity.ok(documentService.getDocumentByWorkspace(workspaceId, currentUser));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentResponseDto> getDocument(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID workspaceId,
            @PathVariable UUID documentId
    ) {
        return ResponseEntity.ok(documentService.getDocumentById(workspaceId, documentId, currentUser));
    }

    @PutMapping("/{documentId}")
    public ResponseEntity<DocumentResponseDto> updateDocument(
            @PathVariable UUID workspaceId,
            @PathVariable UUID documentId,
            @RequestBody DocumentRequestDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(documentService.updateDocument(workspaceId, documentId, request, currentUser));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID workspaceId,
            @PathVariable UUID documentId,
            @AuthenticationPrincipal User currentUser
    ) {
        documentService.deleteDocument(workspaceId, documentId, currentUser);
        return ResponseEntity.ok().build();
    }

}
