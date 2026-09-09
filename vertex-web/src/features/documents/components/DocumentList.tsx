'use client';

import { Document } from '../types';
import Link from 'next/link';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  workspaceId: string;
}

// Helper function to remove HTML tags and return pure text
const stripHtml = (html: string | undefined) => {
  if (!html) return '';
  // This Regex targets anything between < and > and replaces it with an empty string
  return html.replace(/<[^>]*>?/gm, '').trim();
};

export const DocumentList = ({ documents, isLoading, workspaceId }: DocumentListProps) => {
  if (isLoading) return <p className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-100">Loading documents...</p>;
  
  if (documents.length === 0) return <p className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-100">No documents yet. Create one above!</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {documents.map((doc) => {
        // Extract the plain text from the HTML before displaying it
        const plainTextPreview = stripHtml(doc.content);
        
        return (
          <Link 
            key={doc.id} 
            href={`/workspaces/${workspaceId}/documents/${doc.id}`}
            className="block"
          >
            <div className="p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-40">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 flex-1 line-clamp-2">
                {plainTextPreview ? plainTextPreview : 'Empty document'}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Updated {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};