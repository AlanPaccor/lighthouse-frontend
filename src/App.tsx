import { useState, useEffect, useRef } from 'react';
import { api, dbConnectionsApi } from './services/api';
import type { Trace, Stats } from './types/Trace';
import TraceList from './components/TraceList';
import StatsPanel from './components/StatsPanel';
import ChatInterface from './components/ChatInterface';
import CostChart from './components/CostChart';
import ConfidenceChart from './components/ConfidenceChart';
import DatabaseConnectionManager from './components/DatabaseConnectionManager';
import DatabaseBrowser from './components/DatabaseBrowser';
import ApiKeyManager from './components/ApiKeyManager';
import ProjectManager from './components/ProjectManager';

function App() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDbConnectionId, setSelectedDbConnectionId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dbConnections, setDbConnections] = useState<any[]>([]);
  const [checkingTraces, setCheckingTraces] = useState<Set<string>>(new Set());
  const checkingTracesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadDbConnections();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedProjectId, dbConnections.length]);

  // Poll for new traces every 5 seconds for auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Silently refresh data without showing loading state
      const refreshData = async () => {
        try {
          const [tracesData, statsData] = await Promise.all([
            api.getTraces(selectedProjectId),
            api.getStats(selectedProjectId),
          ]);
          setTraces(tracesData);
          setStats(statsData);
          // Check for hallucinations on new traces
          checkTracesForHallucinations(tracesData);
        } catch (error) {
          console.error('Failed to refresh data:', error);
        }
      };
      refreshData();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [selectedProjectId, dbConnections.length]);

  const loadDbConnections = async () => {
    try {
      const connections = await dbConnectionsApi.getAll();
      const connected = connections.filter(c => c.isConnected);
      setDbConnections(connected);
      if (!selectedDbConnectionId && connected.length > 0) {
        setSelectedDbConnectionId(connected[0].id);
      }
    } catch (error) {
      console.error('Failed to load database connections:', error);
    }
  };

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const [tracesData, statsData] = await Promise.all([
        api.getTraces(selectedProjectId),
        api.getStats(selectedProjectId),
      ]);
      setTraces(tracesData);
      setStats(statsData);
      checkTracesForHallucinations(tracesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const checkTracesForHallucinations = async (tracesToCheck: Trace[]) => {
    // Wait for database connections to load
    if (dbConnections.length === 0) {
      await loadDbConnections();
    }

    const dbConnection = dbConnections.find(c => c.isConnected);
    if (!dbConnection) {
      console.log('No connected database available for hallucination detection');
      return;
    }

    // Check each trace that doesn't have hallucination data
    for (const trace of tracesToCheck) {
      // Skip if already has hallucination data
      if (trace.hallucinationData) continue;
      
      // Skip if already being checked
      if (checkingTracesRef.current.has(trace.id)) continue;
      
      // Skip if no response
      if (!trace.response || trace.response.trim().length === 0) continue;
      
      // Mark as being checked
      checkingTracesRef.current.add(trace.id);
      setCheckingTraces(new Set(checkingTracesRef.current));
      
      try {
        console.log(`🔍 Checking hallucinations for trace: ${trace.id}`);
        const updatedTrace = await api.checkHallucinations(trace.id, dbConnection.id);
        
        // Update the trace in state
        setTraces(prev => prev.map(t => 
          t.id === trace.id ? updatedTrace : t
        ));
        
        console.log(`✅ Hallucination check completed - Confidence: ${updatedTrace.confidenceScore}%`);
      } catch (error) {
        console.error(`❌ Failed to check hallucinations for trace ${trace.id}:`, error);
      } finally {
        // Remove from checking set after delay
        setTimeout(() => {
          checkingTracesRef.current.delete(trace.id);
          setCheckingTraces(new Set(checkingTracesRef.current));
        }, 5000);
      }
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
      
      // If trace doesn't have hallucination data but we have a DB connection, check it
      if (!newTrace.hallucinationData && dbConnections.length > 0) {
        const dbConnection = dbConnections.find(c => c.isConnected);
        if (dbConnection) {
          checkingTracesRef.current.add(newTrace.id);
          setCheckingTraces(new Set(checkingTracesRef.current));
          
          try {
            console.log(`🔍 Checking hallucinations for new trace: ${newTrace.id}`);
            const updatedTrace = await api.checkHallucinations(newTrace.id, dbConnection.id);
            setTraces((prev) => prev.map(t => t.id === newTrace.id ? updatedTrace : t));
            console.log(`✅ Hallucination check completed - Confidence: ${updatedTrace.confidenceScore}%`);
          } catch (error) {
            console.error('Failed to check hallucinations for new trace:', error);
          } finally {
            setTimeout(() => {
              checkingTracesRef.current.delete(newTrace.id);
              setCheckingTraces(new Set(checkingTracesRef.current));
            }, 1000);
          }
        }
      }
      
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

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <StatsPanel stats={stats} />
        
        <ProjectManager 
          onSelectProject={setSelectedProjectId}
          selectedProjectId={selectedProjectId}
        />
        
        <ApiKeyManager />

        <DatabaseBrowser connectionId={selectedDbConnectionId} />
        <DatabaseConnectionManager
          onSelectConnection={setSelectedDbConnectionId}
          selectedConnectionId={selectedDbConnectionId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="space-y-6 flex flex-col">
            <ChatInterface
              onSubmit={handleQuerySubmit}
              selectedDbConnectionId={selectedDbConnectionId}
            />
            <CostChart traces={traces} />
          </div>

          <div className="flex flex-col min-h-0">
            <TraceList traces={traces} checkingTraces={checkingTraces} />
          </div>
        </div>

        <ConfidenceChart traces={traces} />
      </div>
    </div>
  );
}

export default App;