// src/components/ChatInterface.tsx
import { useState } from 'react';

interface ChatInterfaceProps {
  onSubmit: (prompt: string) => Promise<void>;
}

export default function ChatInterface({ onSubmit }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      await onSubmit(prompt);
      setPrompt('');
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    'Explain how AI works',
    'What is machine learning?',
    'Write a haiku about coding',
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">💬 Test AI Query</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Send Query'}
        </button>
      </form>

      {/* Example Queries */}
      <div className="mt-4">
        <div className="text-sm text-gray-400 mb-2">Try these examples:</div>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((query, i) => (
            <button
              key={i}
              onClick={() => setPrompt(query)}
              className="text-xs bg-gray-900 hover:bg-gray-700 px-3 py-1.5 rounded-full border border-gray-700 transition"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}