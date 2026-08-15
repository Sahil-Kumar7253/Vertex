import Link from 'next/link';

export default function DocumentEditorPage({ 
  params 
}: { 
  params: { id: string; docId: string } 
}) {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
        
        {/* Editor Navigation & Toolbar */}
        <header className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Link 
              href={`/workspaces/${params.id}`}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <input 
                type="text" 
                defaultValue="Loading Title..." 
                className="text-xl font-bold text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors px-1"
              />
              <p className="text-xs text-gray-400 font-mono mt-1 px-1">Doc ID: {params.docId}</p>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm">
            Save Changes
          </button>
        </header>

        {/* Text Editor Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <textarea 
            className="flex-1 w-full p-8 resize-none outline-none text-gray-700 leading-relaxed"
            placeholder="Start writing..."
            defaultValue="Loading content..."
          />
        </div>
        
      </div>
    </main>
  );
}