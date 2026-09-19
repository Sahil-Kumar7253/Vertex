'use client';

import { useState} from 'react';
import { useWorkspaceMembers } from '../hooks/useWorkspaceMembers';
import { Role } from '../types';

export const MembersManager = ({ workspaceId }: { workspaceId: string }) => {
    const { members, isLoading, error, inviteMember } = useWorkspaceMembers(workspaceId);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('EDITOR');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);

    const handleInvite = async (e : React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) return;
        setIsInviting(true);
        setInviteError(null);
        try{
            await inviteMember({ email, role });
            setEmail('');
            setRole('EDITOR');
        } catch (error) {
            setInviteError('Failed to invite member');
        } finally {
            setIsInviting(false);
        }
    };

    if (isLoading) return <div className="p-4 bg-white rounded-xl border border-gray-100">Loading team...</div>;

    return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Workspace Members</h3>
        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {/* Member List */}
      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {error && <p className="p-4 text-sm text-red-600 bg-red-50">{error}</p>}
        {members.map((member) => (
          <div key={member.memberId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {member.email.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-gray-900">{member.email}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${
              member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
              member.role === 'EDITOR' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {member.role}
            </span>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isInviting}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            disabled={isInviting}
          >
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={isInviting || !email.trim()}
            className="px-4 py-2 text-sm text-white font-medium bg-gray-900 hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50"
          >
            {isInviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>
        {inviteError && <p className="text-xs text-red-600 mt-2">{inviteError}</p>}
      </div>
    </div>
  );
}