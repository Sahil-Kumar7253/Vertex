import {useState, useEffect, useCallback} from "react";
import {documentApi} from "../api";
import {Document, DocumentRequestDto} from "../types";

export const useDocuments = (workspaceId: string) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        if(!workspaceId) return;
        setIsLoading(true);
        setError(null);

        try{
            const data = await documentApi.getDocuments(workspaceId);
            setDocuments(data);
        } catch (err) {
            setError("Failed to fetch documents");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const createDocument = async (documentData: DocumentRequestDto) => {
        try{
            const newDocument = await documentApi.createDocument(workspaceId, documentData);
            setDocuments(prevDocuments => [...prevDocuments, newDocument]);
            return newDocument;
        }catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to create document');
        }
    }

    return {
        documents,
        isLoading,
        error,
        createDocument,
        refreshDocuments: fetchDocuments,
    };
};

