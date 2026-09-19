import {useState, useEffect, useCallback} from "react";
import {workspaceApi} from "../api";
import {Workspace} from "../types";

export const usePendingInvites = (onInviteAccepted?: () => void) => {
    const [invites, setInvites] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchInvites = useCallback(async () => {
        setIsLoading(true);
        try{
            const data = await workspaceApi.getPendingInvites();
            setInvites(data);
        }catch (err: any) {
            console.error(err);
        }finally {
            setIsLoading(false);
        }

    }, []);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleAccept = async (workspaceId: string) => {
        try{
            await workspaceApi.acceptInvite(workspaceId);
            setInvites((prev) => prev.filter(inv => inv.id !== workspaceId));
            if (onInviteAccepted) onInviteAccepted();
        } catch (error) {
            console.error("Failed to accept invite", error);
        }
    }

    const handleReject = async (workspaceId: string) => {
        try{
            await workspaceApi.rejectInvite(workspaceId);
            setInvites((prev) => prev.filter(inv => inv.id !== workspaceId));
        } catch (error) {
            console.error("Failed to reject invite", error);
        }
    }

    return {invites, isLoading, handleAccept, handleReject};
}
