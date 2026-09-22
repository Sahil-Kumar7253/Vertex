import api from '@/lib/api'; // Adjust this import based on your axios/fetch setup
import { UserProfile, UpdateProfileData } from './types';

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/users/me', data);
    return response.data;
  }
};