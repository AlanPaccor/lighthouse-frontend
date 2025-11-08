// src/components/ChatInterface.tsx
import { useState } from 'react';
import type { Trace } from '../types/Trace';

interface ChatInterfaceProps {
  onSubmit: (prompt: string, dbConnectionId?: string) => Promise<Trace>;
  selectedDbConnectionId: string | null;
}

export default function ChatInterface({ onSubmit, selectedDbConnectionId }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<Trace | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const trace = await onSubmit(prompt, selectedDbConnectionId || undefined);
      setLastResponse(trace);
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
    <div className="glass-card rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        💬 Test AI Query
      </h2>

      {selectedDbConnectionId && (
        <div className="mb-4 text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-300 backdrop-blur-sm">
          🔌 Queries will use your connected database
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 min-h-[120px] transition-all backdrop-blur-sm"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 disabled:shadow-none transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Processing...
            </span>
          ) : (
            'Send Query'
          )}
        </button>
      </form>

      {/* Display Last Response */}
      {lastResponse && (
        <div className="mt-6 p-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-300">🤖 AI Response</div>
            <div className="text-xs text-gray-500">
              {lastResponse.latencyMs}ms • {lastResponse.tokensUsed} tokens
            </div>
          </div>
          <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
            {lastResponse.response || 'No response generated'}
          </div>
        </div>
      )}

      {/* Example Queries */}
      <div className="mt-5">
        <div className="text-sm text-gray-400 mb-3 font-medium">Try these examples:</div>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((query, i) => (
            <button
              key={i}
              onClick={() => setPrompt(query)}
              className="text-xs bg-gray-900/50 hover:bg-gray-800/80 px-4 py-2 rounded-full border border-gray-700/50 transition-all hover:border-blue-500/50 hover:scale-105 backdrop-blur-sm"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}