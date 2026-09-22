'use client';

import Link from 'next/link'; // 1. Ensure Link is imported
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { CreateWorkspaceForm } from "@/features/workspaces/components/CreateWorkspaceForm";
import { WorkspaceList } from "@/features/workspaces/components/WorkspaceList";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PendingInvitesPanel } from '@/features/workspaces/components/PendingInvitePanel';
import { usePendingInvites } from "@/features/workspaces/hooks/usePendingInvites"; 

export default function WorkspacesPage() {
  const { workspaces, isLoading, error, createWorkspace, refreshWorkspaces } = useWorkspaces();
  const { logout } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  const { invites } = usePendingInvites();
  const [showInvitesPanel, setShowInvitesPanel] = useState(false);

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
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your projects and collaborations.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* THE BELL ICON (Pending Invites) */}
            <button 
              onClick={() => setShowInvitesPanel(!showInvitesPanel)}
              className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Invitations"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {invites.length > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                  {invites.length}
                </span>
              )}
            </button>

            {/* NEW: THE PROFILE LINK */}
            <Link 
              href="/profile"
              className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Profile Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* SIGN OUT BUTTON */}
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Sign Out
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 text-red-700 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {(showInvitesPanel || invites.length > 0) && (
          <PendingInvitesPanel onInviteAccepted={refreshWorkspaces} />
        )}

        {/* Stacked Layout Sections */}
        <CreateWorkspaceForm onCreate={handleCreate} isLoading={isCreating} />
        <WorkspaceList workspaces={workspaces} isLoading={isLoading} />
        
      </div>
    </main>
  );
}