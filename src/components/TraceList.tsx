// src/components/TraceList.tsx
import type { Trace } from '../types/Trace';
import { useState } from 'react';

interface TraceListProps {
  traces: Trace[];
}

export default function TraceList({ traces }: TraceListProps) {
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">📋 Recent Traces</h2>
        <p className="text-sm text-gray-400 mt-1">
          {traces.length} {traces.length === 1 ? 'query' : 'queries'} tracked
        </p>
      </div>

      <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
        {traces.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No traces yet. Try sending a query!
          </div>
        ) : (
          traces.map((trace) => (
            <div
              key={trace.id}
              onClick={() => setSelectedTrace(trace)}
              className="p-4 hover:bg-gray-700 cursor-pointer transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {trace.prompt}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(trace.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                    {trace.provider}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>💰 ${trace.costUsd.toFixed(6)}</span>
                <span>🪙 {trace.tokensUsed} tokens</span>
                <span>⚡ {trace.latencyMs}ms</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for trace details */}
      {selectedTrace && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTrace(null)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold">Trace Details</h3>
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
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => setSelectedTrace(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition"
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