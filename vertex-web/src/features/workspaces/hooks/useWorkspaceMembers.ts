import {useState, useEffect, useCallback} from "react";
import {workspaceApi} from "../api";
import {WorkspaceMember, InviteMemberRequest} from "../types";

export const useWorkspaceMembers = (workspaceId: string) => {
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        if (!workspaceId) return;
        setIsLoading(true);
        try{
            const data = await workspaceApi.getMembers(workspaceId);
            setMembers(data);
        }catch (err: any) {
            setError(err.message || "Failed to fetch members");
        }finally {
            setIsLoading(false);
        }
    },[workspaceId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const inviteMember = async (inviteData: InviteMemberRequest) => {
        try {
            const newMember = await workspaceApi.inviteMember(workspaceId, inviteData);
            setMembers(prevMembers => [...prevMembers, newMember]);
            return newMember;
        } catch (err: any) {
           throw new Error(err.response?.data?.message || 'Failed to invite member');
        }
    };

    return {members, isLoading, error, inviteMember};

}