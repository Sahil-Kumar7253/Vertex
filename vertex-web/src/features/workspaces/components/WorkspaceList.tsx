'use client';

import {Workspace} from "@/features/workspaces/types";

interface WorkspaceListProps {
    workspaces: Workspace[];
    isLoading: boolean;
}

export const WorkspaceList = ({ workspaces, isLoading }: WorkspaceListProps) => {
    if(isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 flex items-center justify-center">
             <p className="text-gray-500">Loading workspaces...</p>
            </div>
        );      
    }

    if (workspaces.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 flex items-center justify-center">
                <p className="text-gray-500">You don't belong to any workspaces yet.</p>
            </div>
        );
    }
    
    return(
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Your Workspaces</h2>
            </div>
      
            {/* Bounded, scrollable list section */}
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {workspaces.map((workspace) => (
                    <div 
                        key={workspace.id}
                        className="p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div>
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {workspace.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Created {new Date(workspace.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 