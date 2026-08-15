package com.vertex.vertex_api.document;

import com.vertex.vertex_api.user.User;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
        @PathVariable UUID workspaceId
    ){
        return ResponseEntity.ok(documentService.getDocumentByWorkspace(workspaceId));
    }

}
