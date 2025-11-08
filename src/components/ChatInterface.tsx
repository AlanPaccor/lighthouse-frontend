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
    'Explain how transformer models work',
    'What are the key differences between GPT and BERT?',
    'How does reinforcement learning from human feedback work?',
  ];

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <h2 className="card-header">AI Query Interface</h2>
        <p className="card-subtitle mt-2">
          Send queries to your AI models and track performance metrics in real-time
        </p>
      </div>

      {selectedDbConnectionId && (
        <div className="mb-6 flex items-center gap-3 text-sm bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-300 backdrop-blur-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <span className="font-medium">Database connection active • Queries will use your connected database</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Query Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your query or prompt here..."
            className="input-field min-h-[140px] resize-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Query...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Execute Query
            </span>
          )}
        </button>
      </form>

      {/* Display Last Response */}
      {lastResponse && (
        <div className="mt-8 p-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">AI Response</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lastResponse.latencyMs}ms latency • {lastResponse.tokensUsed.toLocaleString()} tokens
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-mono bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            {lastResponse.response || 'No response generated'}
          </div>
        </div>
      )}

      {/* Example Queries */}
      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <div className="text-sm text-slate-400 mb-4 font-semibold uppercase tracking-wider">Example Queries</div>
        <div className="flex flex-wrap gap-3">
          {exampleQueries.map((query, i) => (
            <button
              key={i}
              onClick={() => setPrompt(query)}
              className="text-sm bg-slate-900/60 hover:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50 transition-all hover:border-blue-500/50 hover:scale-[1.02] backdrop-blur-sm font-medium text-slate-300 hover:text-white"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}