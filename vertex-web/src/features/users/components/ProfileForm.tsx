'use client';

import { useState, useEffect } from 'react';
import { UserProfile, UpdateProfileData } from '../types';

interface ProfileFormProps {
  profile: UserProfile;
  isSaving: boolean;
  // UPDATE THIS LINE: change Promise<void> to Promise<UserProfile>
  onSubmit: (data: UpdateProfileData) => Promise<UserProfile>; 
}

export const ProfileForm = ({ profile, isSaving, onSubmit }: ProfileFormProps) => {
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initial profile data to local state
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    // Frontend Validation
    if (newPassword || currentPassword) {
      if (!currentPassword) return setLocalError('Please enter your current password to set a new one.');
      if (newPassword.length < 6) return setLocalError('New password must be at least 6 characters.');
      if (newPassword !== confirmPassword) return setLocalError('New passwords do not match.');
    }

    try {
      await onSubmit({
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      
      setSuccessMessage('Profile updated successfully!');
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {(localError || successMessage) && (
        <div className={`p-4 text-sm border-b ${localError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
          {localError || successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
        
        {/* General Info Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
            <p className="text-sm text-gray-500">Update your display name.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="p-6 sm:p-8 space-y-6 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500">Change your password. Leave blank if you don't want to change it.</p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="p-6 sm:p-8 bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};