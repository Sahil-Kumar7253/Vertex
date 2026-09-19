'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useDocuments } from '@/features/documents/hooks/useDocuments';

import { CreateDocumentForm } from '@/features/documents/components/createDocumentForm';
import { DocumentList } from '@/features/documents/components/DocumentList';
import { MembersManager } from '@/features/workspaces/components/MembersManager';

import { DocumentRequestDto } from '@/features/documents/types';
import { workspaceApi } from '@/features/workspaces/api';

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { user } = useAuth();
  const { workspaces } = useWorkspaces();

  const {
    documents,
    isLoading,
    error,
    createDocument,
  } = useDocuments(id);

  const [isCreating, setIsCreating] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentWorkspace = workspaces.find((w) => w.id === id);
  const isOwner = currentWorkspace?.ownerId === user?.id;

  console.log('Owner Debug:', {
  user,
  userId: user?.id,
  currentWorkspace,
  ownerId: currentWorkspace?.ownerId,
  isOwner: currentWorkspace?.ownerId === user?.id,
});

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

  const handleLeaveOrDelete = async () => {
    const actionName = isOwner ? 'delete' : 'leave';

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionName} this workspace? This action cannot be undone.`
    );

    if (!confirmAction) return;

    setIsProcessingAction(true);
    setActionError(null);

    try {
      if (isOwner) {
        await workspaceApi.deleteWorkspace(id);
      } else {
        await workspaceApi.leaveWorkspace(id);
      }

      router.push('/workspaces');
    } catch (err: any) {
      setActionError(
        err.response?.data?.message ||
          `Failed to ${actionName} workspace.`
      );

      setIsProcessingAction(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ---------------------------------------------------------
            TOP NAVIGATION
        --------------------------------------------------------- */}
        <div className="mb-6">
          <Link
            href="/workspaces"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>

            Back to Workspaces
          </Link>
        </div>

        {/* ---------------------------------------------------------
            WORKSPACE HEADER
        --------------------------------------------------------- */}
        <header className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            {/* Workspace information */}
            <div className="min-w-0">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                    {currentWorkspace?.name || 'Workspace View'}
                  </h1>

                  <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                    Workspace ID:{' '}
                    <span className="font-mono">{id}</span>
                  </p>
                </div>

              </div>
            </div>

            {/* Workspace actions */}
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              {/* Create document */}
              <div className="w-full sm:w-auto">
                <CreateDocumentForm
                  onCreate={handleCreate}
                  isLoading={isCreating}
                />
              </div>

              {/* Leave / Delete */}
              <button
                onClick={handleLeaveOrDelete}
                disabled={isProcessingAction}
                className="
                  inline-flex
                  min-h-[42px]
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-red-600
                  transition-colors
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  whitespace-nowrap
                "
              >
                {isProcessingAction
                  ? 'Processing...'
                  : isOwner
                    ? 'Delete Workspace'
                    : 'Leave Workspace'}
              </button>

            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------
            ERROR MESSAGES
        --------------------------------------------------------- */}
        {(actionError || error) && (
          <div className="mt-5 space-y-3">

            {actionError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.52 20h14.96a2 2 0 001.73-3.14l-7.5-13a2 2 0 00-3.42 0z"
                  />
                </svg>

                <span>{actionError}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.52 20h14.96a2 2 0 001.73-3.14l-7.5-13a2 2 0 00-3.42 0z"
                  />
                </svg>

                <span>{error}</span>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------------
            MAIN CONTENT
        --------------------------------------------------------- */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* -------------------------------------------------------
              DOCUMENTS
          ------------------------------------------------------- */}
          <section className="min-w-0 lg:col-span-2">

            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Documents
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage documents in this workspace
                </p>
              </div>

              {documents && documents.length > 0 && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {documents.length}{' '}
                  {documents.length === 1 ? 'document' : 'documents'}
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <DocumentList
                documents={documents}
                isLoading={isLoading}
                workspaceId={id}
              />
            </div>

          </section>

          {/* -------------------------------------------------------
              TEAM
          ------------------------------------------------------- */}
          <aside className="min-w-0">

            <div className="mb-4 px-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Team
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Workspace members and access
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <MembersManager workspaceId={id} />
            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}