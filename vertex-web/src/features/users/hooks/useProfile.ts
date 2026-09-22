import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api';
import { UserProfile, UpdateProfileData } from '../types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: UpdateProfileData) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await userApi.updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return { profile, isLoading, isSaving, error, updateProfile };
};