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
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="space-y-4">
        <div className="h-px w-16 bg-foreground"></div>
        <h2 className="text-3xl font-light text-foreground tracking-tight">AI Query Interface</h2>
        <p className="text-sm text-foreground/60 font-light">
          Send queries to your AI models and track performance metrics in real-time
        </p>
      </div>

      {selectedDbConnectionId && (
        <div className="border border-foreground/20 p-4 space-y-2">
          <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Database Connection Active</div>
          <div className="text-xs text-foreground/80 font-light">Queries will use your connected database</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Query Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your query or prompt here..."
            className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light min-h-[140px] resize-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {loading ? 'Processing Query...' : 'Execute Query'}
          </span>
          {!loading && (
            <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
          )}
        </button>
      </form>

      {/* Display Last Response */}
      {lastResponse && (
        <div className="border border-foreground/20 p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-px w-12 bg-foreground"></div>
            <div className="text-sm font-medium text-foreground uppercase tracking-wider">AI Response</div>
            <div className="text-xs text-foreground/50 font-light">
              {lastResponse.latencyMs}ms latency • {lastResponse.tokensUsed.toLocaleString()} tokens
            </div>
          </div>
          <div className="text-sm text-foreground/80 font-mono bg-foreground/5 p-4 border border-foreground/10 whitespace-pre-wrap leading-relaxed">
            {lastResponse.response || 'No response generated'}
          </div>
        </div>
      )}

      {/* Example Queries */}
      <div className="pt-6 border-t border-foreground/10 space-y-4">
        <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Example Queries</div>
        <div className="flex flex-wrap gap-3">
          {exampleQueries.map((query, i) => (
            <button
              key={i}
              onClick={() => setPrompt(query)}
              className="px-4 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
