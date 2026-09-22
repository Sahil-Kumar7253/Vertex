import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Document, DocumentRequestDto } from '../types';

interface UseAutoSaveProps {
  document: Document | null;
  title: string;
  content: string;
  canEdit: boolean;
  isInitialized: boolean;
  saveDocument: (data: DocumentRequestDto) => Promise<any>;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useAutoSave = ({ document, title, content, canEdit, isInitialized, saveDocument }: UseAutoSaveProps) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (!canEdit || !document || !isInitialized) return;
    if (debouncedTitle === document.title && debouncedContent === document.content) return;

    const performAutoSave = async () => {
      setSaveStatus('saving');
      try {
        await saveDocument({ title: debouncedTitle, content: debouncedContent });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus('error');
      }
    };

    performAutoSave();
  }, [debouncedTitle, debouncedContent, document, saveDocument, isInitialized, canEdit]);

  // Expose a manual save function for the back button
  const forceSave = async () => {
    if (canEdit && document && (title !== document.title || content !== document.content)) {
      setSaveStatus('saving');
      await saveDocument({ title, content });
    }
  };

  return { saveStatus, forceSave };
};