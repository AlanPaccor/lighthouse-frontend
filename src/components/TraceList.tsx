// src/components/TraceList.tsx
import type { Trace } from '../types/Trace';
import { useState } from 'react';
import HallucinationWarning from './HallucinationWarning';

interface TraceListProps {
  traces: Trace[];
  checkingTraces?: Set<string>;
}

export default function TraceList({ traces, checkingTraces }: TraceListProps) {
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  return (
    <div className="bg-background border border-foreground/10 flex flex-col h-full">
      <div className="p-8 border-b border-foreground/10 flex-shrink-0 space-y-4">
        <div className="h-px w-16 bg-foreground"></div>
        <h2 className="text-3xl font-light text-foreground tracking-tight">Query History</h2>
        <p className="text-sm text-foreground/60 font-light">
          {traces.length} {traces.length === 1 ? 'query' : 'queries'} tracked
        </p>
      </div>

      <div className="divide-y divide-foreground/10 max-h-[1000px] overflow-y-auto">
        {traces.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="h-px w-12 bg-foreground/20 mx-auto"></div>
            <div className="text-foreground/60 font-light">No queries yet</div>
            <div className="text-xs text-foreground/50 font-light">Execute a query to see it appear here</div>
          </div>
        ) : (
          traces.map((trace) => (
            <div
              key={trace.id}
              onClick={() => setSelectedTrace(trace)}
              className="p-6 hover:bg-muted/10 cursor-pointer transition-colors border-l-4 border-transparent hover:border-foreground/20 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate mb-2">
                    {trace.prompt}
                  </div>
                  <div className="text-xs text-foreground/50 font-light">
                    {new Date(trace.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="ml-4">
                  <span className="text-xs bg-foreground/10 text-foreground px-3 py-1.5 uppercase tracking-wider font-medium">
                    {trace.provider}
                  </span>
                </div>
              </div>

              {/* Response Preview */}
              {trace.response && (
                <div className="mt-4 p-4 bg-foreground/5 border border-foreground/10 space-y-3">
                  <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Response Preview</div>
                  <div className="text-sm text-foreground/80 line-clamp-2 leading-relaxed font-light">
                    {trace.response}
                  </div>
                  {!trace.hallucinationData && checkingTraces?.has(trace.id) && (
                    <div className="border border-foreground/20 p-3 text-xs text-foreground/60 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-foreground/40 border-t-transparent rounded-full animate-spin"></div>
                      Checking for hallucinations...
                    </div>
                  )}
                  <HallucinationWarning trace={trace} />
                </div>
              )}

              <div className="flex items-center gap-6 text-xs mt-4">
                <span className="flex items-center gap-2 text-foreground/80 font-medium">
                  {trace.costUsd < 0.0001 && trace.costUsd > 0
                    ? `$${trace.costUsd.toFixed(6)}`
                    : trace.costUsd === 0
                    ? '$0.00'
                    : `$${trace.costUsd.toFixed(4)}`}
                </span>
                <span className="flex items-center gap-2 text-foreground/80 font-medium">
                  {trace.tokensUsed.toLocaleString()} tokens
                </span>
                <span className="flex items-center gap-2 text-foreground/80 font-medium">
                  {trace.latencyMs}ms
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for trace details */}
      {selectedTrace && (
        <div
          className="fixed inset-0 bg-foreground/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTrace(null)}
        >
          <div
            className="bg-background border border-foreground/20 max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 space-y-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="h-px w-16 bg-foreground"></div>
              <h3 className="text-3xl font-light text-foreground tracking-tight">Query Details</h3>
              <p className="text-sm text-foreground/60 font-light">
                Complete information for this AI query execution
              </p>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Prompt</label>
                <div className="bg-foreground/5 p-4 border border-foreground/10 text-foreground font-mono text-sm">
                  {selectedTrace.prompt}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Response</label>
                <div className="bg-foreground/5 p-4 border border-foreground/10 whitespace-pre-wrap text-foreground font-mono text-sm leading-relaxed max-h-96 overflow-y-auto">
                  {selectedTrace.response}
                </div>
                {selectedTrace.hallucinationData && (
                  <div className="mt-4">
                    <HallucinationWarning trace={selectedTrace} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-px bg-foreground/10">
                <div className="bg-background p-4 space-y-2">
                  <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Cost</div>
                  <div className="text-2xl font-light text-foreground">
                    {selectedTrace.costUsd < 0.0001 && selectedTrace.costUsd > 0
                      ? `$${selectedTrace.costUsd.toFixed(6)}`
                      : selectedTrace.costUsd === 0
                      ? '$0.00'
                      : `$${selectedTrace.costUsd.toFixed(4)}`}
                  </div>
                </div>
                <div className="bg-background p-4 space-y-2">
                  <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Tokens</div>
                  <div className="text-2xl font-light text-foreground">{selectedTrace.tokensUsed.toLocaleString()}</div>
                </div>
                <div className="bg-background p-4 space-y-2">
                  <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Latency</div>
                  <div className="text-2xl font-light text-foreground">{selectedTrace.latencyMs}ms</div>
                </div>
                <div className="bg-background p-4 space-y-2">
                  <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Provider</div>
                  <div className="text-2xl font-light text-foreground">{selectedTrace.provider}</div>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-foreground/10">
              <button
                onClick={() => setSelectedTrace(null)}
                className="w-full px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
