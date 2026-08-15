'use client';

import {useWorkspaces} from "@/features/workspaces/hooks/useWorkspaces";
import {CreateWorkspaceForm} from "@/features/workspaces/components/CreateWorkspaceForm";
import {WorkspaceList} from "@/features/workspaces/components/WorkspaceList";
import {useState} from "react";

export default function WorkspacesPage() {
    const {workspaces, isLoading, error, createWorkspace} = useWorkspaces();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (name: string) => {
    setIsCreating(true);
    try {
      await createWorkspace(name);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      {/* Single-column centered structure */}
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your projects and collaborations.</p>
        </header>

        {error && (
          <div className="p-4 text-red-700 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Stacked Layout Sections */}
        <CreateWorkspaceForm onCreate={handleCreate} isLoading={isCreating} />
        
        <WorkspaceList workspaces={workspaces} isLoading={isLoading} />
        
      </div>
    </main>
  );
}