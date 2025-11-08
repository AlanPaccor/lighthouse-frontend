// src/App.tsx
import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { Trace, Stats } from './types/Trace';
import TraceList from './components/TraceList.tsx';
import StatsPanel from './components/StatsPanel.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import CostChart from './components/CostChart.tsx';

function App() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tracesData, statsData] = await Promise.all([
        api.getTraces(),
        api.getStats(),
      ]);
      setTraces(tracesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async (prompt: string) => {
    try {
      const newTrace = await api.executeQuery(prompt);
      setTraces([newTrace, ...traces]);
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Failed to execute query:', error);
    }
  };

  const handleClearTraces = async () => {
    if (confirm('Clear all traces?')) {
      await api.clearTraces();
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔍 AI Observatory</h1>
            <p className="text-gray-400 text-sm">Real-time AI monitoring & cost tracking</p>
          </div>
          <button
            onClick={handleClearTraces}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Clear All Traces
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Panel */}
        <StatsPanel stats={stats} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Chat Interface */}
          <div className="space-y-6">
            <ChatInterface onSubmit={handleQuerySubmit} />
            <CostChart traces={traces} />
          </div>

          {/* Right: Trace List */}
          <TraceList traces={traces} />
        </div>
      </div>
    </div>
  );
}

export default App;