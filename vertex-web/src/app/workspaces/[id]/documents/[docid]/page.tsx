'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { RichTextEditor } from '@/features/documents/components/RichTextEditor';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Client } from '@stomp/stompjs'; // <--- NEW IMPORT

export default function DocumentEditorPage({
  params
}: {
  params: Promise<{ id: string; docid: string }>
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuth(); // Need user ID to ignore our own broadcasts
  
  const { document, isLoading, saveDocument } = useDocument(
    resolvedParams.id,
    resolvedParams.docid,
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // WebSocket State
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isLive, setIsLive] = useState(false);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Initial load
  useEffect(() => {
    if (document && !isInitialized) {
      setTitle(document.title);
      setContent(document.content || '');
      setIsInitialized(true);
    }
  }, [document, isInitialized]);

  // STOMP WebSocket Connection Effect
  useEffect(() => {
    if (!isInitialized || !user) return;

    const token = localStorage.getItem('token');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      // SockJS Fallback if raw WebSocket fails
      // webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsLive(true);
        
        // Subscribe to this specific document's topic
        client.subscribe(`/topic/documents/${resolvedParams.docid}`, (message) => {
          const payload = JSON.parse(message.body);
          
          // Only update UI if the message came from someone else!
          if (payload.senderId !== user.id) {
            if (payload.title !== undefined) setTitle(payload.title);
            if (payload.content !== undefined) setContent(payload.content);
          }
        });
      },
      onDisconnect: () => setIsLive(false)
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [isInitialized, resolvedParams.docid, user]);

  // The DB Auto-Save Effect (Preserved exactly as you had it)
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

  const handleBack = async () => {
    if (document && (title !== document.title || content !== document.content)) {
      setSaveStatus('saving');
      await saveDocument({ title, content }); 
    }
    router.push(`/workspaces/${resolvedParams.id}`);
  };

  // Helper to publish changes out to teammates
  const broadcastChange = (newTitle: string, newContent: string) => {
    if (stompClient && stompClient.connected && user) {
      stompClient.publish({
        destination: `/app/documents/${resolvedParams.docid}/edit`,
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          senderId: user.id
        })
      });
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
      <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
        
        <header className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
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
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  broadcastChange(newTitle, content);
                }}
                className="text-xl font-bold text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors px-1"
                placeholder="Document Title"
              />
            </div>
          </div>
          
          <div className="px-4 py-2 text-sm font-medium flex items-center gap-4 text-gray-500">
            {/* Live Indicator */}
            {isLive ? (
              <span className="flex items-center gap-2 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-400 bg-gray-50 px-2 py-1 rounded-full text-xs border border-gray-200">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Offline
              </span>
            )}

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
          {isInitialized && (
            <RichTextEditor 
              content={content} 
              onChange={(newHtml) => {
                setContent(newHtml);
                broadcastChange(title, newHtml);
              }} 
            />
          )}
        </div>
        
      </div>
    </main>
  );
}