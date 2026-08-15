export interface Document {
    id: string;
    title: string;
    content: string;
    workspaceId: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentRequestDto{
    title: string;
    content? : string;
}