import { Highlighter } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Highlighter className="w-8 h-8 text-white" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your workspace...</p>
      </div>
    </div>
  );
};

export default Loading;