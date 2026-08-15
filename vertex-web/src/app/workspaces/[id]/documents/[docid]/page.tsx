'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useDocument } from '@/features/documents/hooks/useDocument';

export default function DocumentEditorPage({
  params
}: {
  params: Promise<{ id: string; docid: string }>
}) {
  const resolvedParams = use(params);
  const { document, isLoading, isSaving, saveDocument } = useDocument(
    resolvedParams.id,
    resolvedParams.docid,
  );

  // Local state for the editor inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showToast, setShowToast] = useState(false);

  // When the document loads from the database, populate the input fields
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content || '');
    }
  }, [document]);

  const handleSave = async () => {
    try {
      await saveDocument({ title, content });
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      {showToast && (
        <div className="fixed right-6 top-6 z-50 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-emerald-600/20">
          Document saved successfully
        </div>
      )}

      <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
        
        {/* Editor Navigation & Toolbar */}
        <header className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Link 
              href={`/workspaces/${resolvedParams.id}`}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors px-1"
                placeholder="Document Title"
              />
              {document && (
                <p className="text-xs text-gray-400 mt-1 px-1">
                  Last updated {new Date(document.updatedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </header>

        {/* Text Editor Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full p-8 resize-none outline-none text-gray-700 leading-relaxed"
            placeholder="Start writing..."
          />
        </div>
        
      </div>
    </main>
  );
}