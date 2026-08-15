'use client';

import {useState} from 'react';
import {DocumentRequestDto} from "../types";

interface CreateDocumentFormProps{
    onCreate: (documentData: DocumentRequestDto) => Promise<void>;
    isLoading: boolean;
}

export const CreateDocumentForm: React.FC<CreateDocumentFormProps> = ({onCreate, isLoading}) => {
    const [title, setTitle] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;
        
        await onCreate({title, content: ''});
        setTitle('');
    };

    return(
        <form onSubmit={handleSubmit} className="flex gap-4">
            <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="New document title..."
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-6 py-2 text-white font-medium bg-gray-900 hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50"
            >
                {isLoading ? 'Adding...' : 'New Document'}
            </button>
        </form>
    );
};