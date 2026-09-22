'use client';

import { SaveStatus } from '../hooks/useAutoSave';
import { ActiveUser } from '../hooks/useCollaboration';
import { ExportMenu } from './ExportMenu'; // <-- Import the new menu

interface EditorHeaderProps {
  title: string;
  content: string; // <-- Add content to props
  onTitleChange: (newTitle: string) => void;
  onBack: () => void;
  canEdit: boolean;
  isLive: boolean;
  saveStatus: SaveStatus;
  activeUsers: ActiveUser[];
  currentUser: { id: string; email: string } | null;
}

export const EditorHeader = ({ title, content, onTitleChange, onBack, canEdit, isLive, saveStatus, activeUsers, currentUser }: EditorHeaderProps) => {
  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();
  const getName = (email: string) => email.split('@')[0];
  const typingUsers = activeUsers.filter(u => u.isTyping && u.userId !== currentUser?.id);
  const sortedUsers = [...activeUsers].sort((a, b) => {
    if (a.userId === currentUser?.id) return -1;
    if (b.userId === currentUser?.id) return 1;
    return 0;
  });

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 z-20 relative">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div className="flex-1 w-full">
          <input 
            type="text" 
            value={title}
            disabled={!canEdit}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full text-xl font-bold text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors px-1 disabled:opacity-80 disabled:hover:border-transparent"
            placeholder="Document Title"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
        
        {typingUsers.length > 0 && (
          <span className="text-blue-500 text-xs italic animate-pulse hidden sm:block">
            {typingUsers.length === 1 ? `${getName(typingUsers[0].email)} is typing...` : 'Multiple people typing...'}
          </span>
        )}

        {sortedUsers.length > 0 && (
          <div className="flex items-center -space-x-2">
            {sortedUsers.map((activeUser) => {
              const isMe = activeUser.userId === currentUser?.id;
              const displayName = isMe ? `${getName(activeUser.email)} (You)` : getName(activeUser.email);
              
              return (
                <div key={activeUser.userId} className="relative group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm transition-transform group-hover:z-10 group-hover:scale-110 cursor-help relative
                    ${isMe ? 'bg-gray-800 text-white' : 'bg-blue-500 text-white'}
                    ${activeUser.isTyping ? 'animate-bounce ring-2 ring-blue-300' : ''}`}
                  >
                    {getInitials(activeUser.email)}
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    {displayName}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

        {/* INJECT EXPORT MENU HERE */}
        <ExportMenu title={title} content={content} />

        {/* STATUS INDICATORS */}
        <div className="flex items-center gap-3">
          {/* ... (Existing Live/Offline and Save status code remains exactly the same) ... */}
          {isLive ? (
            <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200" title="Connected to server">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2 py-1 rounded-full text-xs border border-gray-200">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>Offline
            </span>
          )}

          {canEdit && saveStatus === 'saving' && (
             <span className="flex items-center gap-1.5 text-gray-500 w-20">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>Saving...
             </span>
          )}
          {canEdit && saveStatus === 'saved' && (
             <span className="flex items-center gap-1.5 text-green-600 w-20">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Saved
             </span>
          )}
        </div>
      </div>
    </header>
  );
};