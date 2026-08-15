import {useState, useEffect, useCallback} from "react";
import {workspaceApi} from "../api";
import {Workspace} from "../types";

export const useWorkspaces = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await workspaceApi.getWorkspaces();
            setWorkspaces(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load workspaces');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const createWorkspace = async (name: string) => {
        try{
            const newWorkspace = await workspaceApi.createWorkspace({ name });
            setWorkspaces(prev => [...prev, newWorkspace]);
            return newWorkspace;
        }catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create workspace');
            throw err;
        }
    };

    return {
        workspaces,
        isLoading,
        error,
        createWorkspace,
        refreshWorkspaces: fetchWorkspaces
    };
};