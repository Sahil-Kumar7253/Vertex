import {useState, useEffect, useCallback} from "react";
import {documentApi} from "../api";
import {Document, DocumentRequestDto} from "../types";

export const useDocument = (workspaceId: string, documentId: string) => {
    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocument = useCallback(async () => {
        setIsLoading(true);
        try{
            const data = await documentApi.getDocument(workspaceId, documentId);
            setDocument(data);
        } catch (err) {
            setError("Failed to fetch document");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId, documentId]);

    useEffect(() => {
        if(workspaceId && documentId) {
            fetchDocument();
        }
    }, [fetchDocument, workspaceId, documentId]);

    const saveDocument = async (data: DocumentRequestDto) => {
        setIsSaving(true);
        try{
            const updatedDocument = await documentApi.updateDocument(workspaceId, documentId, data);
            setDocument(updatedDocument);
            return updatedDocument;
        }catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to save document');
        }finally {
            setIsSaving(false);
        } 
    };

    return {document, isLoading, isSaving, error, saveDocument};
}