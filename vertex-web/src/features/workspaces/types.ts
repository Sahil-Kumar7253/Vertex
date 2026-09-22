export type MemberStatus = 'PENDING' | 'ACCEPTED';
export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    currentUserRole: Role;
}

export interface WorkspaceRequestDto {
    name: string;
}

export interface WorkspaceMember {
  memberId: string;
  userId: string;
  email: string;
  role: Role;
  status: MemberStatus;
}

export interface InviteMemberRequest {
  email: string;
  role: Role;
}