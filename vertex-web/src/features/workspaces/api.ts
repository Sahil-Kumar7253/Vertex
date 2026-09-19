import api from "../../lib/api";
import { InviteMemberRequest, Workspace, WorkspaceMember, WorkspaceRequestDto } from "./types";

export const workspaceApi = {
    getWorkspaces: async (): Promise<Workspace[]> => {
        const response = await api.get<Workspace[]>("/workspaces");
        return response.data;
    },

    createWorkspace: async (data: WorkspaceRequestDto): Promise<Workspace> => {
        const response = await api.post<Workspace>("/workspaces", data);
        return response.data;
    },

    getMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
        const response = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
        return response.data;
    },

    inviteMember: async (workspaceId: string, data: InviteMemberRequest): Promise<WorkspaceMember> => {
        const response = await api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, data);
        return response.data;
    },

    getPendingInvites: async (): Promise<Workspace[]> => {
        const response = await api.get<Workspace[]>('/workspaces/invites');
        return response.data;
    },

    acceptInvite: async (workspaceId: string): Promise<void> => {
        await api.post(`/workspaces/${workspaceId}/invites/accept`);
    },

    rejectInvite: async (workspaceId: string): Promise<void> => {
        await api.delete(`/workspaces/${workspaceId}/invites/reject`);
    },

    // Add this inside your workspaceApi object:
    leaveWorkspace: async (workspaceId: string): Promise<void> => {
        await api.delete(`/workspaces/${workspaceId}/leave`);
    },

    // Add this inside your workspaceApi object:
    deleteWorkspace: async (workspaceId: string): Promise<void> => {
        await api.delete(`/workspaces/${workspaceId}`);
    },
};

