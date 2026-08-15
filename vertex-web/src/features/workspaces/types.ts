export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export interface WorkspaceRequestDto {
    name: string;
}
