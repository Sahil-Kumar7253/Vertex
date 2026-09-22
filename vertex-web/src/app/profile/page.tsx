'use client';

import Link from 'next/link';
import { useProfile } from '@/features/users/hooks/useProfile';
import { ProfileForm } from '@/features/users/components/ProfileForm';

export default function ProfilePage() {
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account settings and security.</p>
          </div>
          <Link
            href="/workspaces"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            Back to Dashboard
          </Link>
        </header>

        {/* Global Error Fallback (if fetch completely fails) */}
        {error && !profile && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Render Form when data is ready */}
        {profile && (
          <ProfileForm 
            profile={profile} 
            isSaving={isSaving} 
            onSubmit={updateProfile} 
          />
        )}

      </div>
    </main>
  );
}