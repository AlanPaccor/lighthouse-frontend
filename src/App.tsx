// src/App.tsx
import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { Trace, Stats } from './types/Trace';
import TraceList from './components/TraceList.tsx';
import StatsPanel from './components/StatsPanel.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import CostChart from './components/CostChart.tsx';
import DatabaseConnectionManager from './components/DatabaseConnectionManager';
import DatabaseBrowser from './components/DatabaseBrowser';


function App() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDbConnectionId, setSelectedDbConnectionId] = useState<string | null>(null);

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

  const handleQuerySubmit = async (prompt: string, dbConnectionId?: string): Promise<Trace> => {
    console.log("=== QUERY SUBMISSION ===");
    console.log("Prompt:", prompt);
    console.log("DB Connection ID:", dbConnectionId);
    console.log("Will use DB:", dbConnectionId ? "YES" : "NO");

    try {
      const newTrace = dbConnectionId
        ? await api.executeQueryWithDB(prompt, dbConnectionId)
        : await api.executeQuery(prompt);

      console.log("Query result:", newTrace);
      setTraces([newTrace, ...traces]);
      loadData();
      return newTrace;
    } catch (error) {
      console.error("Query failed:", error);
      throw error;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-white text-xl font-medium">Loading AI Observatory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="glass-card border-b border-gray-700/50 px-6 py-5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">🔍 AI Observatory</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time AI monitoring & cost tracking</p>
          </div>
          <button
            onClick={handleClearTraces}
            className="px-5 py-2.5 bg-red-600/90 hover:bg-red-600 rounded-lg transition-all shadow-lg hover:shadow-red-500/50 font-medium"
          >
            Clear All Traces
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Panel */}
        <StatsPanel stats={stats} />
        
        <DatabaseBrowser connectionId={selectedDbConnectionId} />

        {/* Database Connection Manager */}
        <DatabaseConnectionManager
          onSelectConnection={setSelectedDbConnectionId}
          selectedConnectionId={selectedDbConnectionId}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Chat Interface */}
          <div className="space-y-6">
            <ChatInterface 
              onSubmit={handleQuerySubmit} 
              selectedDbConnectionId={selectedDbConnectionId}
            />
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
