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
    <div className="glass-card rounded-2xl shadow-xl flex flex-col h-full">
      <div className="p-8 border-b border-slate-700/50 flex-shrink-0">
        <h2 className="card-header">Query History</h2>
        <p className="card-subtitle mt-2">
          {traces.length} {traces.length === 1 ? 'query' : 'queries'} tracked
        </p>
      </div>

      <div className="divide-y divide-slate-700/50 max-h-[1000px] overflow-y-auto">
        {traces.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-slate-400 font-medium mb-1">No queries yet</div>
            <div className="text-slate-500 text-sm">Execute a query to see it appear here</div>
          </div>
        ) : (
          traces.map((trace) => (
            <div
              key={trace.id}
              onClick={() => setSelectedTrace(trace)}
              className="p-6 hover:bg-slate-800/40 cursor-pointer transition-all border-l-4 border-transparent hover:border-blue-500/50 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate mb-2 group-hover:text-white transition-colors">
                    {trace.prompt}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {new Date(trace.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                    {trace.provider}
                  </span>
                </div>
              </div>

              {/* Response Preview */}
              {trace.response && (
                <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Response Preview</div>
                  <div className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {trace.response}
                  </div>
                  {!trace.hallucinationData && checkingTraces?.has(trace.id) && (
                    <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Checking for hallucinations...
                    </div>
                  )}
                  <HallucinationWarning trace={trace} />
                </div>
              )}

              <div className="flex items-center gap-6 text-xs mt-4">
                <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {trace.costUsd < 0.0001 && trace.costUsd > 0
                    ? `$${trace.costUsd.toFixed(6)}`
                    : trace.costUsd === 0
                    ? '$0.00'
                    : `$${trace.costUsd.toFixed(4)}`}
                </span>
                <span className="flex items-center gap-2 text-blue-400 font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  {trace.tokensUsed.toLocaleString()} tokens
                </span>
                <span className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTrace(null)}
        >
          <div
            className="glass-card rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-700/50">
              <h3 className="card-header">Query Details</h3>
              <p className="card-subtitle mt-2">
                Complete information for this AI query execution
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-sm text-slate-400 mb-2.5 block font-semibold uppercase tracking-wider">Prompt</label>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 text-slate-200 font-mono text-sm">
                  {selectedTrace.prompt}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2.5 block font-semibold uppercase tracking-wider">Response</label>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 whitespace-pre-wrap text-slate-200 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto">
                  {selectedTrace.response}
                </div>
                {/* Hallucination Warning inside modal */}
                {selectedTrace.hallucinationData && (
                  <div className="mt-4">
                    <HallucinationWarning trace={selectedTrace} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Cost</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {selectedTrace.costUsd < 0.0001 && selectedTrace.costUsd > 0
                      ? `$${selectedTrace.costUsd.toFixed(6)}`
                      : selectedTrace.costUsd === 0
                      ? '$0.00'
                      : `$${selectedTrace.costUsd.toFixed(4)}`}
                  </div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Tokens</div>
                  <div className="text-2xl font-bold text-blue-400">{selectedTrace.tokensUsed.toLocaleString()}</div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Latency</div>
                  <div className="text-2xl font-bold text-indigo-400">{selectedTrace.latencyMs}ms</div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Provider</div>
                  <div className="text-2xl font-bold text-purple-400">{selectedTrace.provider}</div>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-700/50">
              <button
                onClick={() => setSelectedTrace(null)}
                className="btn-secondary w-full"
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