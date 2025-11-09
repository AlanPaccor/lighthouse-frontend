import { useState, useEffect, useRef } from 'react';
import { api, dbConnectionsApi, BASE_URL } from '../services/api';
import type { Trace, Stats } from '../types/Trace';
import { useAuth } from '../contexts/AuthContext';
import TraceList from './TraceList';
import StatsPanel from './StatsPanel';
import ChatInterface from './ChatInterface';
import CostChart from './CostChart';
import ConfidenceChart from './ConfidenceChart';
import DatabaseConnectionManager from './DatabaseConnectionManager';
import DatabaseBrowser from './DatabaseBrowser';
import ApiKeyManager from './ApiKeyManager';
import ProjectManager from './ProjectManager';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDbConnectionId, setSelectedDbConnectionId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dbConnections, setDbConnections] = useState<any[]>([]);
  const [checkingTraces, setCheckingTraces] = useState<Set<string>>(new Set());
  const checkingTracesRef = useRef<Set<string>>(new Set());
  const [apiError, setApiError] = useState<string | null>(null);

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
      const connections = await dbConnectionsApi.getAll().catch(err => {
        console.error('Error loading DB connections:', err);
        return [];
      });
      const connected = connections.filter(c => c.isConnected);
      setDbConnections(connected);
      if (!selectedDbConnectionId && connected.length > 0) {
        setSelectedDbConnectionId(connected[0].id);
      }
    } catch (error) {
      console.error('Failed to load database connections:', error);
      setDbConnections([]);
    }
  };

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const [tracesData, statsData] = await Promise.all([
        api.getTraces(selectedProjectId).catch(err => {
          console.error('Error loading traces:', err);
          return [];
        }),
        api.getStats(selectedProjectId).catch(err => {
          console.error('Error loading stats:', err);
          return { totalCost: 0, totalRequests: 0, averageLatency: 0 };
        }),
      ]);
      setTraces(tracesData || []);
      setStats(statsData || { totalCost: 0, totalRequests: 0, averageLatency: 0 });
      if (tracesData && tracesData.length > 0) {
        checkTracesForHallucinations(tracesData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty defaults on error
      setTraces([]);
      setStats({ totalCost: 0, totalRequests: 0, averageLatency: 0 });
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

  // Check for 403 errors and show helpful message
  useEffect(() => {
    const checkApiAccess = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/traces`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 403) {
          setApiError('backend-auth-required');
        } else {
          setApiError(null);
        }
      } catch (error: any) {
        // Check if it's a 403 or network error
        if (error.message?.includes('403') || error.message?.includes('Failed to fetch')) {
          setApiError('backend-auth-required');
        }
      }
    };
    checkApiAccess();
  }, []);

  if (apiError === 'backend-auth-required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4">
        <div className="glass-card rounded-2xl p-8 max-w-2xl w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Backend Authentication Required</h1>
            <p className="text-slate-400">
              The backend is requiring authentication, but no auth token is being sent.
            </p>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 font-medium mb-2">Quick Fix:</p>
            <p className="text-yellow-300/80 text-sm mb-3">
              Update your backend <code className="bg-slate-800 px-2 py-1 rounded">SecurityConfig.java</code> to allow requests without authentication for development.
            </p>
            <div className="bg-slate-900/50 rounded p-3 text-xs font-mono text-slate-300 overflow-x-auto">
              <div>.authorizeHttpRequests(auth -&gt; auth</div>
              <div className="ml-4">.anyRequest().permitAll() // Allow all requests</div>
              <div>);</div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-slate-300 text-sm">See <code className="bg-slate-800 px-2 py-1 rounded">BACKEND_SECURITY_FIX.md</code> for complete instructions.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
            >
              Retry After Backend Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-slate-300">
                {user.email}
              </div>
            )}
            <button onClick={signOut} className="btn-secondary text-sm">
              Sign Out
            </button>
            <button onClick={handleClearTraces} className="btn-danger text-sm">
              Clear All Traces
            </button>
          </div>
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

