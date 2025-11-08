// src/components/TraceList.tsx
import type { Trace } from '../types/Trace';
import { useState } from 'react';

interface TraceListProps {
  traces: Trace[];
}

export default function TraceList({ traces }: TraceListProps) {
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  return (
    <div className="glass-card rounded-xl shadow-xl">
      <div className="p-6 border-b border-gray-700/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          📋 Recent Traces
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          {traces.length} {traces.length === 1 ? 'query' : 'queries'} tracked
        </p>
      </div>

      <div className="divide-y divide-gray-700/50 max-h-[600px] overflow-y-auto">
        {traces.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-gray-400">No traces yet. Try sending a query!</div>
          </div>
        ) : (
          traces.map((trace) => (
            <div
              key={trace.id}
              onClick={() => setSelectedTrace(trace)}
              className="p-5 hover:bg-gray-700/30 cursor-pointer transition-all border-l-4 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate mb-1">
                    {trace.prompt}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(trace.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full font-medium shadow-md">
                    {trace.provider}
                  </span>
                </div>
              </div>

              {/* Response Preview */}
              {trace.response && (
                <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="text-xs text-gray-400 mb-1.5 font-medium">Response:</div>
                  <div className="text-sm text-gray-300 line-clamp-2">
                    {trace.response}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-5 text-xs mt-3">
                <span className="flex items-center gap-1 text-green-400 font-medium">
                  💰 ${trace.costUsd.toFixed(6)}
                </span>
                <span className="flex items-center gap-1 text-blue-400 font-medium">
                  🪙 {trace.tokensUsed} tokens
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-medium">
                  ⚡ {trace.latencyMs}ms
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for trace details */}
      {selectedTrace && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setSelectedTrace(null)}
        >
          <div
            className="glass-card rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trace Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Prompt</div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                  {selectedTrace.prompt}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Response</div>
                <div className="bg-gray-900 p-3 rounded border border-gray-700 whitespace-pre-wrap">
                  {selectedTrace.response}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Cost</div>
                  <div className="text-lg font-bold">${selectedTrace.costUsd.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tokens</div>
                  <div className="text-lg font-bold">{selectedTrace.tokensUsed}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Latency</div>
                  <div className="text-lg font-bold">{selectedTrace.latencyMs}ms</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Provider</div>
                  <div className="text-lg font-bold">{selectedTrace.provider}</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700/50">
              <button
                onClick={() => setSelectedTrace(null)}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 py-3 rounded-xl transition-all font-medium shadow-lg"
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