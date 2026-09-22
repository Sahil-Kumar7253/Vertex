'use client';

import { Document } from '../types';
import Link from 'next/link';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  workspaceId: string;
  canEdit: boolean; // Added for role security
  onDelete: (documentId: string) => void; // Added for deletion
}

const stripHtml = (html: string | undefined) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
};

export const DocumentList = ({ documents, isLoading, workspaceId, canEdit, onDelete }: DocumentListProps) => {
  if (isLoading) return <p className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-100">Loading documents...</p>;
  
  if (documents.length === 0) return <p className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-100">No documents yet. Create one above!</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {documents.map((doc) => {
        const plainTextPreview = stripHtml(doc.content);
        
        return (
          <Link 
            key={doc.id} 
            href={`/workspaces/${workspaceId}/documents/${doc.id}`}
            className="block group relative"
          >
            <div className="p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col h-40">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 pr-8">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 flex-1 line-clamp-2">
                {plainTextPreview ? plainTextPreview : 'Empty document'}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Updated {new Date(doc.updatedAt).toLocaleDateString()}
              </p>

              {/* DELETE BUTTON: Only renders if user is Admin or Editor */}
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevents the Link from routing
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this document?")) {
                      onDelete(doc.id);
                    }
                  }}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Document"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};