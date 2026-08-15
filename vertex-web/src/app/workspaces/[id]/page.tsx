import Link from 'next/link';

export default function WorkspaceDetailsPage({ params }: { params: { id: string } }) {
  
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header Navigation */}
        <header className="flex items-center gap-4">
          <Link 
            href="/workspaces"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspace View</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {params.id}</p>
          </div>
        </header>

        {/* Placeholder for future Document list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">This workspace is empty</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            We've successfully routed into the workspace. The next step is building the backend Document entity to fill this space!
          </p>
        </div>
        
      </div>
    </main>
  );
}