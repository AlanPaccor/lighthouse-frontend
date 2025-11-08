// src/components/DatabaseConnectionManager.tsx
import { useState, useEffect } from 'react';
import { dbConnectionsApi, type DBConnection } from '../services/api';

interface DatabaseConnectionManagerProps {
  onSelectConnection: (id: string) => void;
  selectedConnectionId: string | null;
}

export default function DatabaseConnectionManager({ 
  onSelectConnection, 
  selectedConnectionId 
}: DatabaseConnectionManagerProps) {
  const [connections, setConnections] = useState<DBConnection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await dbConnectionsApi.getAll();
      setConnections(data);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await dbConnectionsApi.create({
        name: formData.name,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
      });
      
      setFormData({
        name: '',
        host: 'localhost',
        port: 5432,
        database: '',
        username: '',
        password: '',
      });
      setShowForm(false);
      loadConnections();
    } catch (error) {
      console.error('Failed to create connection:', error);
      alert('Failed to create connection. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (id: string) => {
    setLoading(true);
    try {
      const result = await dbConnectionsApi.test(id);
      alert(result.message);
      loadConnections();
    } catch (error) {
      console.error('Failed to test connection:', error);
      alert('Failed to test connection');
    } finally {
      setLoading(false);
    }
  };

  const deleteConnection = async (id: string) => {
    if (confirm('Delete this connection?')) {
      try {
        await dbConnectionsApi.delete(id);
        loadConnections();
      } catch (error) {
        console.error('Failed to delete connection:', error);
        alert('Failed to delete connection');
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="card-header">Database Connections</h2>
          <p className="card-subtitle mt-2">
            Connect and manage your database instances for AI-powered queries
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Connection
            </span>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div>
            <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Connection Name</label>
            <input
              type="text"
              placeholder="e.g., Production Database"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Host</label>
              <input
                type="text"
                placeholder="localhost"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Port</label>
              <input
                type="number"
                placeholder="5432"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Database Name</label>
            <input
              type="text"
              placeholder="database_name"
              value={formData.database}
              onChange={(e) => setFormData({ ...formData, database: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Username</label>
            <input
              type="text"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-success w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing Connection...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Connect & Test
              </span>
            )}
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div className="text-slate-400 font-medium mb-1">No connections configured</div>
            <div className="text-slate-500 text-sm">Create a new connection to get started</div>
          </div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className={`bg-slate-900/60 p-6 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.01] ${
                selectedConnectionId === conn.id
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-xl shadow-blue-500/20'
                  : 'border-slate-700/50 hover:border-slate-600/50'
              }`}
              onClick={() => onSelectConnection(conn.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="font-bold text-white text-lg">{conn.name}</div>
                    {conn.isConnected ? (
                      <span className="text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Connected
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Disconnected
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-800/50">
                    {conn.username}@{conn.host}:{conn.port}/{conn.database}
                  </div>
                  {conn.lastError && (
                    <div className="text-xs text-red-300 mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 font-medium">
                      {conn.lastError}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testConnection(conn.id);
                    }}
                    className="text-xs btn-secondary px-3 py-1.5 text-sm"
                  >
                    Test
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConnection(conn.id);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all border border-red-500/20 hover:border-red-500/40 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {connections.length > 0 && (
        <div className={`mt-6 text-sm p-4 rounded-xl border backdrop-blur-sm ${
          selectedConnectionId 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-slate-900/60 border-slate-700/50 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            {selectedConnectionId ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Connection active • Queries will use this database</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Select a connection to enable database-powered queries</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}