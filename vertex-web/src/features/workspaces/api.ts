import api from "../../lib/api";
import { Workspace, WorkspaceRequestDto } from "./types";

export const workspaceApi = {
    getWorkspaces: async (): Promise<Workspace[]> => {
        const response = await api.get<Workspace[]>("/workspaces");
        return response.data;
    },

    createWorkspace: async (data: WorkspaceRequestDto): Promise<Workspace> => {
        const response = await api.post<Workspace>("/workspaces", data);
        return response.data;
    },
};

