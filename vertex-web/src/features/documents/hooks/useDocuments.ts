import { useState, useEffect, useCallback } from 'react';
import { documentApi } from '../api';
import { Document, DocumentRequestDto } from '../types';

export const useDocuments = (workspaceId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const data = await documentApi.getDocuments(workspaceId);
      setDocuments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (data: DocumentRequestDto) => {
    try {
      const newDoc = await documentApi.createDocument(workspaceId, data);
      setDocuments((prev) => [...prev, newDoc]);
      return newDoc;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create document');
    }
  };

  // ADDED THIS FUNCTION:
  const deleteDocument = async (documentId: string) => {
    if (!workspaceId) return;
    try {
      await documentApi.deleteDocument(workspaceId, documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document');
      throw err;
    }
  };

  return { documents, isLoading, error, createDocument, deleteDocument, refreshDocuments: fetchDocuments };
};