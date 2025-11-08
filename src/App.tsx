import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { Trace, Stats } from './types/Trace';
import TraceList from './components/TraceList';
import StatsPanel from './components/StatsPanel';
import ChatInterface from './components/ChatInterface';
import CostChart from './components/CostChart';
import ConfidenceChart from './components/ConfidenceChart';
import DatabaseConnectionManager from './components/DatabaseConnectionManager';
import DatabaseBrowser from './components/DatabaseBrowser';
import ApiKeyManager from './components/ApiKeyManager';

function App() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDbConnectionId, setSelectedDbConnectionId] = useState<string | null>(null);

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
      setTraces((prev) => [newTrace, ...prev]);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-400 mb-6"></div>
          <div className="text-white text-xl font-semibold">Initializing Lighthouse</div>
          <div className="text-slate-400 text-sm mt-2">Loading your AI observatory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="glass-card border-b border-slate-700/30 px-8 py-6 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text tracking-tight">Lighthouse</h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              AI observability platform • Real-time monitoring & analytics
            </p>
          </div>
          <button onClick={handleClearTraces} className="btn-danger text-sm">
            Clear All Traces
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <StatsPanel stats={stats} />
        <ApiKeyManager />

        <DatabaseBrowser connectionId={selectedDbConnectionId} />
        <DatabaseConnectionManager
          onSelectConnection={setSelectedDbConnectionId}
          selectedConnectionId={selectedDbConnectionId}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Chat Interface & Cost Chart */}
          <div className="space-y-6 flex flex-col">
            <ChatInterface
              onSubmit={handleQuerySubmit}
              selectedDbConnectionId={selectedDbConnectionId}
            />
            <CostChart traces={traces} />
          </div>

          {/* Right: Query History */}
          <div className="flex flex-col min-h-0">
            <TraceList traces={traces} />
          </div>
        </div>

        {/* Confidence Chart - Full Width */}
        <ConfidenceChart traces={traces} />
      </div>
    </div>
  );
}

export default App;
