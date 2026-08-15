'use client';

import { useState } from "react";

interface CreateWorkspaceFormProps {
    onCreate: (name: string) => Promise<void>;
    isLoading: boolean;
}

export const CreateWorkspaceForm = ({ onCreate, isLoading }: CreateWorkspaceFormProps) => {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) return;

        setError(null);
        try{
            await onCreate(name);
            setName("");
        } catch (err) {
            setError("Failed to create workspace.");
        }
    };

    return(
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Workspace</h2>
            <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g., Spring Boot Migration"
                        disabled={isLoading}
                    />
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="px-6 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isLoading ? 'Creating...' : 'Create'}
                </button>
            </form>
        </div>
    );
};