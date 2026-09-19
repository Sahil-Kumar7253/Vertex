'use client';

import { useState } from 'react';
import { useWorkspaceMembers } from '../hooks/useWorkspaceMembers';
import { Role } from '../types';

export const MembersManager = ({ workspaceId }: { workspaceId: string }) => {
  const { members, isLoading, error, inviteMember } = useWorkspaceMembers(workspaceId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // Split members based on status
  const activeMembers = members.filter(m => m.status === 'ACCEPTED');
  const pendingMembers = members.filter(m => m.status === 'PENDING');

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    setInviteMessage(null);
    try {
      await inviteMember({ email, role });
      setEmail('');
      setInviteMessage({ type: 'success', text: 'Invite sent successfully!' });
      setTimeout(() => setInviteMessage(null), 3000); // clear success message after 3s
    } catch (err: any) {
      setInviteMessage({ type: 'error', text: err.message });
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) return <div className="p-4 bg-white rounded-xl border border-gray-100">Loading team...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col gap-4">
      
      {/* 1. SEND INVITE SECTION */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Invite a Teammate</h3>
        <form onSubmit={handleSendInvite} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isInviting}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white w-28"
              disabled={isInviting}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isInviting || !email.trim()}
            className="w-full px-4 py-2 text-sm text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            {isInviting ? 'Sending Invite...' : 'Send Invite'}
          </button>
        </form>
        {inviteMessage && (
          <p className={`text-xs mt-3 ${inviteMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {inviteMessage.text}
          </p>
        )}
      </div>

      {/* 2. ACTIVE TEAM MEMBERS */}
      <div>
        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Team</h3>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{activeMembers.length}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {activeMembers.map((member) => (
            <div key={member.memberId} className="p-3 mx-2 my-1 rounded-lg flex items-center justify-between hover:bg-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate pr-2">{member.email}</p>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-md">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PENDING INVITES (Only shows if there are any) */}
      {pendingMembers.length > 0 && (
        <div>
          <div className="px-4 py-2 border-b border-gray-50 border-t flex justify-between items-center">
            <h3 className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Invited (Pending)</h3>
            <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{pendingMembers.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingMembers.map((member) => (
              <div key={member.memberId} className="p-3 mx-2 my-1 rounded-lg flex items-center justify-between opacity-60">
                <p className="text-sm font-medium text-gray-700 truncate pr-2 italic">{member.email}</p>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};