'use client';

import { usePendingInvites } from '../hooks/usePendingInvites';

interface PendingInvitesPanelProps {
  onInviteAccepted: () => void;
}

export const PendingInvitesPanel = ({ onInviteAccepted }: PendingInvitesPanelProps) => {
  const { invites, isLoading, handleAccept, handleReject } = usePendingInvites(onInviteAccepted);

  if (isLoading || invites.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Invites</h2>
      {invites.map((workspace) => (
        <div 
          key={workspace.id} 
          className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm"
        >
          <div>
            <p className="text-sm font-medium text-blue-900">
              You have been invited to join <span className="font-bold">{workspace.name}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Click accept to collaborate on documents with this team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReject(workspace.id)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => handleAccept(workspace.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept Invite
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};