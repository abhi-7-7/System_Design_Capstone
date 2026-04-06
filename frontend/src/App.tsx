// frontend/src/App.tsx

import { useState, useEffect } from 'react';

function App() {
  const [backendMessage, setBackendMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch('http://localhost:3001') // Point to your backend API
      .then(res => res.json())
      .then(data => setBackendMessage(`Connected to Backend: ${data.message}`))
      .catch(() => setBackendMessage('⚠️ Could not connect to the backend service.'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-indigo-600">Full Stack Monorepo</h1>
        <p className="mt-2 text-lg text-gray-500">React + Vite + Tailwind</p>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-indigo-100">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">API Communication Test</h2>
        
        <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded shadow-inner">
          <p className="text-sm font-medium text-indigo-800">Backend Status:</p>
          <p className="mt-1 text-lg font-mono tracking-tight">{backendMessage}</p>
        </div>

        <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-400 rounded shadow-inner">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Database Status</h3>
            <p className="text-sm text-green-800">Prisma is initialized. Run `npm run db:migrate` to create tables.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
