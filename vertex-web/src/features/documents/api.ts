import api from "@/lib/api";
import {Document, DocumentRequestDto} from "@/features/documents/types";

export const documentApi = {

    getDocuments: async (workspaceId: string): Promise<Document[]> => {
        const response = await api.get(`/workspaces/${workspaceId}/documents`);
        return response.data;
    },

    createDocument: async (workspaceId: string, documentData: DocumentRequestDto): Promise<Document> => {
        const response = await api.post(`/workspaces/${workspaceId}/documents`, documentData);
        return response.data;
    }
}