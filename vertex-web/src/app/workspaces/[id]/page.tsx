'use client';

import Link from "next/link";
import {use, useState} from "react";
import {useDocuments} from "@/features/documents/hooks/useDocuments";
import {CreateDocumentForm} from "@/features/documents/components/createDocumentForm";
import {DocumentList} from "@/features/documents/components/DocumentList";
import {DocumentRequestDto} from "@/features/documents/types";

export default function WorkspacePage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const {documents, isLoading, error, createDocument} = useDocuments(id);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (documentData: DocumentRequestDto) => {
    setIsCreating(true);
    try {
      await createDocument(documentData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return(
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header Navigation */}
        <header className="flex items-center gap-4">
          <Link 
            href="/workspaces"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workspace View</h1>
              <p className="text-sm text-gray-500 font-mono mt-1">ID: {id}</p>
            </div>
            
            {/* Inline Creation Form */}
            <div className="w-96">
              <CreateDocumentForm onCreate={handleCreate} isLoading={isCreating} />
            </div>
          </div>
        </header>

        {error && (
          <div className="p-4 text-red-700 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Document Grid */}
        <DocumentList documents={documents} isLoading={isLoading} workspaceId={id} />
        
      </div>
    </main>
  )
};