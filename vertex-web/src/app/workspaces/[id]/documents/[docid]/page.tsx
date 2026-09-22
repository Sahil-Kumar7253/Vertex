'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, use, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useCollaboration } from '@/features/documents/hooks/useCollaboration';
import { useAutoSave } from '@/features/documents/hooks/useAutoSave';

import { RichTextEditor } from '@/features/documents/components/RichTextEditor';
import { EditorHeader } from '@/features/documents/components/EditorHeader';

export default function DocumentEditorPage({
  params
}: {
  params: Promise<{ id: string; docid: string }>
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const { user } = useAuth();
  const { workspaces } = useWorkspaces();
  const { document, isLoading, saveDocument } = useDocument(resolvedParams.id, resolvedParams.docid);

  // Local Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Security Context
  const currentWorkspace = workspaces.find(w => w.id === resolvedParams.id);
  const canEdit = currentWorkspace?.currentUserRole === 'ADMIN' || currentWorkspace?.currentUserRole === 'EDITOR';

  // Populate data on initial load
  useEffect(() => {
    if (document && !isInitialized) {
      setTitle(document.title);
      setContent(document.content || '');
      setIsInitialized(true);
    }
  }, [document, isInitialized]);

  // Hook 1: Collaboration & WebSockets
  const handleIncomingUpdate = useCallback((newTitle?: string, newContent?: string) => {
    if (newTitle !== undefined) setTitle(newTitle);
    if (newContent !== undefined) setContent(newContent);
  }, []);

  const { isLive, activeUsers, broadcastChange } = useCollaboration({
    documentId: resolvedParams.docid,
    user,
    canEdit,
    onIncomingUpdate: handleIncomingUpdate
  });

  // Hook 2: Auto-Saving
  const { saveStatus, forceSave } = useAutoSave({
    document, title, content, canEdit, isInitialized, saveDocument
  });

  // Handlers
  const handleBack = async () => {
    await forceSave();
    router.push(`/workspaces/${resolvedParams.id}`);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    broadcastChange(newTitle, content);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    broadcastChange(title, newContent);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
        
        <EditorHeader 
          title={title}
          onTitleChange={handleTitleChange}
          onBack={handleBack}
          canEdit={canEdit}
          isLive={isLive}
          saveStatus={saveStatus}
          activeUsers={activeUsers}
          currentUser={user} // <--- ADD THIS LINE HERE
        />

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {isInitialized && (
            <RichTextEditor 
              content={content} 
              editable={canEdit}
              onChange={handleContentChange} 
            />
          )}
        </div>
        
      </div>
    </main>
  );
}