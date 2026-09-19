export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export interface WorkspaceRequestDto {
    name: string;
}

export interface WorkspaceMember {
  memberId: string;
  userId: string;
  email: string;
  role: Role;
}

export interface InviteMemberRequest {
  email: string;
  role: Role;
}