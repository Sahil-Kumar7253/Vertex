export interface UserProfile{
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface UpdateProfileData{
    name?: string;
    currentPassword?: string;
    newPassword?: string;
}