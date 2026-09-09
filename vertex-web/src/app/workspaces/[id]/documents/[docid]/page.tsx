'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useDebounce } from '@/hooks/useDebounce';

export default function DocumentEditorPage({
  params
}: {
  params: Promise<{ id: string; docid: string }>
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { document, isLoading, isSaving, saveDocument } = useDocument(
    resolvedParams.id,
    resolvedParams.docid,
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // 2. Track if we have done our initial data load
  const [isInitialized, setIsInitialized] = useState(false);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Initial load: Only populate the inputs ONCE when the document first arrives
  useEffect(() => {
    if (document && !isInitialized) {
      setTitle(document.title);
      setContent(document.content || '');
      setIsInitialized(true);
    }
  }, [document, isInitialized]);

  // The Auto-Save Effect
  useEffect(() => {
    if (!document || !isInitialized) return;
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
  }, [debouncedTitle, debouncedContent, document, saveDocument, isInitialized]);

  // 3. Intercept the Back button to force an immediate save if needed
  const handleBack = async () => {
    // If the current inputs don't match the database, save immediately!
    if (document && (title !== document.title || content !== document.content)) {
      setSaveStatus('saving');
      await saveDocument({ title, content }); // Use the raw title/content, not debounced
    }
    // Navigate back safely
    router.push(`/workspaces/${resolvedParams.id}`);
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
      <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
        
        <header className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            {/* Replaced the Next.js <Link> with a button that triggers our new logic */}
            <button 
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors px-1"
                placeholder="Document Title"
              />
            </div>
          </div>
          
          <div className="px-4 py-2 text-sm font-medium flex items-center gap-2 text-gray-500">
            {saveStatus === 'saving' && (
               <span className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                 Saving...
               </span>
            )}
            {saveStatus === 'saved' && (
               <span className="flex items-center gap-2 text-green-600">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 Saved to cloud
               </span>
            )}
          </div>
        </header>

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