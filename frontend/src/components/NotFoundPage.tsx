import React, { PureComponent } from 'react';

/**
 * NotFoundPage — styled 404 screen matching the SmartFlow design system.
 * Replaces the bare unstyled div that was previously here.
 */
class NotFoundPage extends PureComponent<object> {
  public render(): React.ReactNode {
    return (
      <div className="min-h-screen bg-[#000000] text-gray-300 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)] mb-8">
          SF
        </div>
        <h1 className="text-7xl font-extrabold text-white tracking-tighter mb-4">404</h1>
        <p className="text-gray-400 text-lg mb-2 font-medium">Page not found</p>
        <p className="text-gray-600 text-sm mb-10 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/dashboard"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20"
        >
          Back to Workspace
        </a>
      </div>
    );
  }
}

export default NotFoundPage;
