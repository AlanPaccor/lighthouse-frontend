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
  const [showDocsPanel, setShowDocsPanel] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-4">
            <div className="h-px w-16 bg-foreground"></div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">
              Backend Authentication Required
            </h1>
            <p className="text-sm text-foreground/60 font-light">
              The backend is requiring authentication, but no auth token is being sent.
            </p>
          </div>
          
          <div className="border border-foreground/20 p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground uppercase tracking-wider">Quick Fix</p>
              <p className="text-xs text-foreground/60 font-light leading-relaxed">
                Update your backend <code className="bg-foreground/10 px-2 py-1 font-mono text-xs">SecurityConfig.java</code> to allow requests without authentication for development.
              </p>
            </div>
            <div className="bg-foreground/5 border border-foreground/10 p-4 font-mono text-xs text-foreground/80 overflow-x-auto">
              <div>.authorizeHttpRequests(auth -&gt; auth</div>
              <div className="ml-4">.anyRequest().permitAll() // Allow all requests</div>
              <div>);</div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-foreground/50 font-light">
              See <code className="bg-foreground/10 px-2 py-1 font-mono text-xs">BACKEND_SECURITY_FIX.md</code> for complete instructions.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90"
            >
              <span className="relative z-10">Retry After Backend Fix</span>
              <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-foreground/20 border-t-foreground"></div>
          <div className="space-y-2">
            <div className="h-px w-16 bg-foreground mx-auto"></div>
            <div className="text-2xl font-light text-foreground tracking-tight">Initializing</div>
            <div className="text-xs text-foreground/60 uppercase tracking-wider font-light">Loading your AI observatory</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10 bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-foreground"></div>
              <h1 className="text-3xl font-light text-foreground tracking-tight">Lighthouse</h1>
            </div>
            <p className="text-xs text-foreground/60 uppercase tracking-wider font-light ml-[60px]">
              AI observability platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-xs text-foreground/60 uppercase tracking-wider font-light">
                {user.email}
              </div>
            )}
            <button
              onClick={() => setShowDocsPanel(true)}
              className="px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
            >
              Docs
            </button>
            <button 
              onClick={signOut} 
              className="px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
            >
              Sign Out
            </button>
            <button 
              onClick={handleClearTraces} 
              className="px-6 py-2 bg-foreground/10 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:bg-foreground/20"
            >
              Clear All
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-12">
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

      {/* Docs Panel Modal */}
      {showDocsPanel && (
        <div
          className="fixed inset-0 bg-foreground/80 backdrop-blur-lg flex items-center justify-center p-4 z-50"
          onClick={() => setShowDocsPanel(false)}
        >
          <div
            className="bg-background border border-foreground/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Section */}
            <section className="space-y-8">
              <div className="h-px w-16 bg-foreground"></div>
              <h1 className="text-5xl font-light text-foreground tracking-tight">
                Documentation
              </h1>
              <p className="text-lg text-foreground/60 font-light max-w-2xl">
                Complete guide to setting up and using Lighthouse for AI observability
              </p>
            </section>

            {/* Table of Contents */}
            <section className="border border-foreground/20 p-8 space-y-4">
              <div className="text-sm font-medium text-foreground uppercase tracking-wider">Table of Contents</div>
              <nav className="space-y-2 text-sm">
                <a className="block text-foreground/60 hover:text-foreground transition-colors font-light">Tech Stack Requirements</a>
                <a className="block text-foreground/60 hover:text-foreground transition-colors font-light">Backend Setup</a>
                <a className="block text-foreground/60 hover:text-foreground transition-colors font-light">Frontend Setup</a>
                <a className="block text-foreground/60 hover:text-foreground transition-colors font-light">Using the Dashboard</a>
                <a className="block text-foreground/60 hover:text-foreground transition-colors font-light">SDK Integration</a>
                <a className="block text-foreground/60 hover:text-foreground transition-colors font-light">API Reference</a>
              </nav>
            </section>

            {/* Tech Stack Requirements */}
            <section id="tech-stack" className="space-y-8">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Tech Stack Requirements</h2>
              
              <div className="space-y-6">
                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Backend Requirements</div>
                  <ul className="space-y-2 text-sm text-foreground/60 font-light list-disc list-inside">
                    <li><strong className="text-foreground">Java 17+</strong> - Required for Spring Boot</li>
                    <li><strong className="text-foreground">Spring Boot 3.x</strong> - Web framework</li>
                    <li><strong className="text-foreground">PostgreSQL 12+</strong> - Database for storing traces, connections, and projects</li>
                    <li><strong className="text-foreground">Maven</strong> - Build tool (Gradle also supported)</li>
                    <li><strong className="text-foreground">Google Gemini 2.0 Flash API</strong> - For AI queries and hallucination detection</li>
                    <li><strong className="text-foreground">Supabase (Optional)</strong> - For authentication in production</li>
                  </ul>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Frontend Requirements</div>
                  <ul className="space-y-2 text-sm text-foreground/60 font-light list-disc list-inside">
                    <li><strong className="text-foreground">Node.js 18+</strong> - Runtime environment</li>
                    <li><strong className="text-foreground">React 18+</strong> - UI framework</li>
                    <li><strong className="text-foreground">TypeScript</strong> - Type safety</li>
                    <li><strong className="text-foreground">Vite</strong> - Build tool and dev server</li>
                    <li><strong className="text-foreground">Tailwind CSS</strong> - Styling</li>
                    <li><strong className="text-foreground">Recharts</strong> - Data visualization</li>
                  </ul>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Compatible Systems</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Lighthouse works on <strong className="text-foreground">macOS</strong>, <strong className="text-foreground">Linux</strong>, and <strong className="text-foreground">Windows</strong>. 
                    The backend requires a JVM, and the frontend requires Node.js. Both can run locally or be deployed to cloud platforms like AWS, GCP, Azure, or Vercel.
                  </p>
                </div>
              </div>
            </section>

            {/* Backend Setup */}
            <section id="backend-setup" className="space-y-8">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Backend Setup</h2>
              
              <div className="space-y-6">
                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 1: Database Setup</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Create a PostgreSQL database for Lighthouse:
                  </p>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Create database
createdb lighthouse_db

# Or using psql
psql -U postgres
CREATE DATABASE lighthouse_db;
\\q`}
                  </pre>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 2: Configure application.properties</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Update <code className="bg-foreground/10 px-1 font-mono text-xs">src/main/resources/application.properties</code>:
                  </p>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/lighthouse_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Gemini API Configuration
gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

# Supabase Configuration (Optional - for production)
supabase.url=
supabase.jwt.secret=

# Server Configuration
server.port=8080
spring.web.cors.allowed-origins=http://localhost:5173`}
                  </pre>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mt-4">
                    <strong className="text-foreground">Get your Gemini API key:</strong> Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Google AI Studio</a> and create an API key.
                  </p>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 3: Build and Run</div>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Or if using an IDE, run the main class:
# com.example.lighthouse.LighthouseApplication`}
                  </pre>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mt-4">
                    The backend will start on <code className="bg-foreground/10 px-1 font-mono text-xs">http://localhost:8080</code>. 
                    Verify it's running by visiting <code className="bg-foreground/10 px-1 font-mono text-xs">http://localhost:8080/api/traces</code> (should return an empty array).
                  </p>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 4: Optional - Supabase Authentication</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    For production, set up Supabase authentication:
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/60 font-light list-decimal list-inside">
                    <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline">supabase.com</a></li>
                    <li>Get your project URL and anon key from Settings → API</li>
                    <li>Get your JWT secret from Settings → API → JWT Settings</li>
                    <li>Update <code className="bg-foreground/10 px-1 font-mono text-xs">application.properties</code> with these values</li>
                    <li>Restart the backend</li>
                  </ol>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mt-4">
                    <strong className="text-foreground">Note:</strong> If Supabase is not configured, the backend will allow unauthenticated requests (development mode).
                  </p>
                </div>
              </div>
            </section>

            {/* Frontend Setup */}
            <section id="frontend-setup" className="space-y-8">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Frontend Setup</h2>
              
              <div className="space-y-6">
                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 1: Install Dependencies</div>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Install Node.js dependencies
npm install

# Or using yarn
yarn install`}
                  </pre>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 2: Configure Environment Variables</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Create a <code className="bg-foreground/10 px-1 font-mono text-xs">.env</code> file in the root directory:
                  </p>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Supabase Configuration (Optional - for production)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                  </pre>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mt-4">
                    <strong className="text-foreground">Note:</strong> If these are not set, the app will run in development mode without authentication.
                  </p>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 3: Start Development Server</div>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Start the dev server
npm run dev

# The app will be available at http://localhost:5173`}
                  </pre>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 4: Build for Production</div>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Build the production bundle
npm run build

# The built files will be in the 'dist' directory
# Serve with any static file server or deploy to Vercel, Netlify, etc.`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Dashboard Usage */}
            <section id="dashboard-usage" className="space-y-8">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Using the Dashboard</h2>
              
              <div className="space-y-6">
                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">1. Configure API Key</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Before making queries, configure your Gemini API key:
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/60 font-light list-decimal list-inside">
                    <li>Navigate to the "API Key Configuration" section in the dashboard</li>
                    <li>Enter your Gemini API key (get it from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Google AI Studio</a>)</li>
                    <li>Click "Save API Key" - the system will validate it automatically</li>
                    <li>Once saved, you can use your own API credits for queries</li>
                  </ol>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">2. Connect a Database (Optional)</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    To enable RAG and hallucination detection, connect a PostgreSQL database:
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/60 font-light list-decimal list-inside">
                    <li>Go to "Database Connections" section</li>
                    <li>Click "+ New Connection"</li>
                    <li>Enter connection details:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li><strong className="text-foreground">Name:</strong> A friendly name for the connection</li>
                        <li><strong className="text-foreground">Host:</strong> Database host (e.g., localhost or IP address)</li>
                        <li><strong className="text-foreground">Port:</strong> PostgreSQL port (default: 5432)</li>
                        <li><strong className="text-foreground">Database:</strong> Database name</li>
                        <li><strong className="text-foreground">Username:</strong> Database username</li>
                        <li><strong className="text-foreground">Password:</strong> Database password</li>
                      </ul>
                    </li>
                    <li>Click "Connect & Test" - the system will verify the connection</li>
                    <li>Once connected, select the connection to use it for queries</li>
                  </ol>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">3. Execute Queries</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Use the AI Query Interface to make queries:
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/60 font-light list-decimal list-inside">
                    <li>Go to the "AI Query Interface" section</li>
                    <li>If a database is connected, you'll see a notification that queries will use the database</li>
                    <li>Enter your query in the text area (e.g., "What hospitals are in the database?")</li>
                    <li>Click "Execute Query"</li>
                    <li>The query will appear in "Query History" with:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Response preview</li>
                        <li>Cost, tokens, and latency metrics</li>
                        <li>Hallucination detection results (if database connected)</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">4. View Analytics</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Monitor your AI operations:
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/60 font-light list-disc list-inside">
                    <li><strong className="text-foreground">Stats Panel:</strong> View total cost, requests, and average latency</li>
                    <li><strong className="text-foreground">Cost Analytics:</strong> Chart showing cost trends over time</li>
                    <li><strong className="text-foreground">Confidence Analytics:</strong> System health score and confidence trends</li>
                    <li><strong className="text-foreground">Query History:</strong> Click any query to see full details including hallucination warnings</li>
                  </ul>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">5. Browse Database</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Explore your connected database:
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/60 font-light list-decimal list-inside">
                    <li>Select a database connection</li>
                    <li>Go to "Database Browser" section</li>
                    <li>View all tables and row counts</li>
                    <li>Click a table to view its data (first 50 rows)</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* SDK Setup */}
            <section id="sdk-setup" className="space-y-8">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">SDK Integration</h2>
              
              <div className="space-y-6">
                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 1: Create a Project</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    In the Lighthouse dashboard:
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/60 font-light list-decimal list-inside">
                    <li>Go to the "Projects" section</li>
                    <li>Click "+ New Project"</li>
                    <li>Enter a project name and optional description</li>
                    <li>Click "Create Project"</li>
                    <li>Copy the generated API key (starts with <code className="bg-foreground/10 px-1 font-mono text-xs">lh_</code>)</li>
                  </ol>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mt-4">
                    <strong className="text-foreground">Important:</strong> Save this API key securely. You'll use it to authenticate SDK requests.
                  </p>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 2: Install HTTP Client</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    The SDK uses HTTP requests to send traces. Use any HTTP client library in your language:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-2">JavaScript/TypeScript (Node.js or Browser):</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Using fetch (built-in)
# No installation needed

# Or using axios
npm install axios`}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-2">Python:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`pip install requests`}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-2">Java:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# Use built-in HttpClient (Java 11+) or OkHttp
# Add to pom.xml:
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.12.0</version>
</dependency>`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 3: Create SDK Wrapper Function</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Wrap your AI API calls with a function that sends traces to Lighthouse:
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-2">JavaScript/TypeScript Example:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`// lighthouse-sdk.js
const LIGHTHOUSE_API_URL = 'http://localhost:8080/api/sdk/traces';
const LIGHTHOUSE_API_KEY = 'lh_your_api_key_here';

async function sendTraceToLighthouse(traceData) {
  try {
    await fetch(LIGHTHOUSE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LIGHTHOUSE_API_KEY
      },
      body: JSON.stringify(traceData)
    });
  } catch (error) {
    console.error('Failed to send trace to Lighthouse:', error);
    // Don't throw - we don't want to break the main flow
  }
}

// Wrap your AI call
async function callAIWithLighthouse(prompt) {
  const startTime = Date.now();
  
  // Your AI API call (example with OpenAI)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const data = await response.json();
  const latencyMs = Date.now() - startTime;
  const responseText = data.choices[0].message.content;
  
  // Estimate tokens (rough calculation)
  const tokensUsed = Math.ceil((prompt.length + responseText.length) / 4);
  
  // Calculate cost (example for GPT-4)
  const costUsd = (tokensUsed / 1000) * 0.03; // $0.03 per 1K tokens
  
  // Send trace to Lighthouse
  await sendTraceToLighthouse({
    prompt: prompt,
    response: responseText,
    tokensUsed: tokensUsed,
    costUsd: costUsd,
    latencyMs: latencyMs,
    provider: 'openai'
  });
  
  return responseText;
}

// Use it
const result = await callAIWithLighthouse('What is the capital of France?');
console.log(result);`}
                      </pre>
                    </div>

                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-2">Python Example:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`# lighthouse_sdk.py
import requests
import time
from typing import Dict, Any

LIGHTHOUSE_API_URL = 'http://localhost:8080/api/sdk/traces'
LIGHTHOUSE_API_KEY = 'lh_your_api_key_here'

def send_trace_to_lighthouse(trace_data: Dict[str, Any]):
    try:
        response = requests.post(
            LIGHTHOUSE_API_URL,
            json=trace_data,
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': LIGHTHOUSE_API_KEY
            },
            timeout=5  # Don't wait too long
        )
        response.raise_for_status()
    except Exception as e:
        print(f'Failed to send trace to Lighthouse: {e}')
        # Don't raise - we don't want to break the main flow

def call_ai_with_lighthouse(prompt: str):
    start_time = time.time()
    
    # Your AI API call (example with OpenAI)
    import openai
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    response = client.chat.completions.create(
        model='gpt-4',
        messages=[{'role': 'user', 'content': prompt}]
    )
    
    latency_ms = int((time.time() - start_time) * 1000)
    response_text = response.choices[0].message.content
    tokens_used = response.usage.total_tokens
    cost_usd = (tokens_used / 1000) * 0.03  # $0.03 per 1K tokens
    
    # Send trace to Lighthouse
    send_trace_to_lighthouse({
        'prompt': prompt,
        'response': response_text,
        'tokensUsed': tokens_used,
        'costUsd': cost_usd,
        'latencyMs': latency_ms,
        'provider': 'openai'
    })
    
    return response_text

# Use it
result = call_ai_with_lighthouse('What is the capital of France?')
print(result)`}
                      </pre>
                    </div>

                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-2">Java Example:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`// LighthouseService.java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import com.google.gson.Gson;

public class LighthouseService {
    private static final String LIGHTHOUSE_API_URL = "http://localhost:8080/api/sdk/traces";
    private static final String LIGHTHOUSE_API_KEY = "lh_your_api_key_here";
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();
    private final Gson gson = new Gson();
    
    public void sendTraceToLighthouse(TraceData traceData) {
        try {
            String json = gson.toJson(traceData);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(LIGHTHOUSE_API_URL))
                .header("Content-Type", "application/json")
                .header("X-API-Key", LIGHTHOUSE_API_KEY)
                .timeout(Duration.ofSeconds(5))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
            
            // Send async - don't block
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .exceptionally(e -> {
                    System.err.println("Failed to send trace to Lighthouse: " + e.getMessage());
                    return null;
                });
        } catch (Exception e) {
            System.err.println("Failed to send trace to Lighthouse: " + e.getMessage());
        }
    }
}

// Usage in your AI service
public class AIService {
    private LighthouseService lighthouseService = new LighthouseService();
    
    public String callAI(String prompt) {
        long startTime = System.currentTimeMillis();
        
        // Your AI API call
        String response = callOpenAI(prompt);
        
        long latencyMs = System.currentTimeMillis() - startTime;
        int tokensUsed = estimateTokens(prompt, response);
        double costUsd = (tokensUsed / 1000.0) * 0.03;
        
        // Send trace to Lighthouse (async)
        TraceData trace = new TraceData(prompt, response, tokensUsed, costUsd, latencyMs, "openai");
        lighthouseService.sendTraceToLighthouse(trace);
        
        return response;
    }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 4: Trace Data Format</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    The trace data sent to Lighthouse must include:
                  </p>
                  <pre className="bg-foreground/5 border border-foreground/10 p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`{
  "prompt": "string (required) - The user's query/prompt",
  "response": "string (required) - The AI's response",
  "tokensUsed": number (required) - Total tokens used",
  "costUsd": number (required) - Cost in USD",
  "latencyMs": number (required) - Response time in milliseconds",
  "provider": "string (required) - AI provider name (e.g., 'openai', 'anthropic', 'gemini')"
}`}
                  </pre>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Step 5: Best Practices</div>
                  <ul className="space-y-2 text-sm text-foreground/60 font-light list-disc list-inside">
                    <li><strong className="text-foreground">Send traces asynchronously:</strong> Don't block your main application flow waiting for Lighthouse</li>
                    <li><strong className="text-foreground">Handle errors gracefully:</strong> If Lighthouse is down, your app should still work</li>
                    <li><strong className="text-foreground">Calculate costs accurately:</strong> Use your AI provider's pricing to calculate costs</li>
                    <li><strong className="text-foreground">Estimate tokens if needed:</strong> If your provider doesn't return token counts, estimate using ~4 characters per token</li>
                    <li><strong className="text-foreground">Use environment variables:</strong> Store your Lighthouse API key in environment variables, not in code</li>
                    <li><strong className="text-foreground">Test in development:</strong> Make sure traces appear in your Lighthouse dashboard before deploying</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference" className="space-y-8">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">API Reference</h2>
              
              <div className="space-y-6">
                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">POST /api/sdk/traces</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Send a trace from your application to Lighthouse.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-1">Headers:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-3 text-xs font-mono text-foreground/80">
{`Content-Type: application/json
X-API-Key: lh_your_api_key_here`}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-1">Request Body:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-3 text-xs font-mono text-foreground/80">
{`{
  "prompt": "What is the capital of France?",
  "response": "The capital of France is Paris.",
  "tokensUsed": 150,
  "costUsd": 0.0003,
  "latencyMs": 250,
  "provider": "openai"
}`}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-1">Response:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-3 text-xs font-mono text-foreground/80">
{`200 OK
{
  "id": "trace-uuid",
  "createdAt": "2025-01-08T12:00:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">GET /api/traces</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Get all traces (optionally filtered by project).
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-1">Query Parameters:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-3 text-xs font-mono text-foreground/80">
{`?projectId=optional-project-id`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/20 p-6 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">GET /api/traces/stats</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-4">
                    Get statistics (optionally filtered by project).
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-1">Query Parameters:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-3 text-xs font-mono text-foreground/80">
{`?projectId=optional-project-id`}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60 font-medium mb-1">Response:</div>
                      <pre className="bg-foreground/5 border border-foreground/10 p-3 text-xs font-mono text-foreground/80">
{`{
  "totalCost": 0.1234,
  "totalRequests": 42,
  "averageLatency": 250.5
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Close Button */}
            <div className="pt-8 border-t border-foreground/10">
              <button
                onClick={() => setShowDocsPanel(false)}
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

