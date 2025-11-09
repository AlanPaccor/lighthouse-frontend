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
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="h-px w-16 bg-foreground"></div>
          <h2 className="text-3xl font-light text-foreground tracking-tight">Database Connections</h2>
          <p className="text-sm text-foreground/60 font-light">
            Connect and manage your database instances for AI-powered queries
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
        >
          {showForm ? 'Cancel' : '+ New Connection'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-foreground/20 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Connection Name</label>
            <input
              type="text"
              placeholder="e.g., Production Database"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Host</label>
              <input
                type="text"
                placeholder="localhost"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Port</label>
              <input
                type="number"
                placeholder="5432"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Database Name</label>
            <input
              type="text"
              placeholder="database_name"
              value={formData.database}
              onChange={(e) => setFormData({ ...formData, database: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Username</label>
            <input
              type="text"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? 'Testing Connection...' : 'Connect & Test'}
            </span>
            {!loading && (
              <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
            )}
          </button>
        </form>
      )}

      <div className="space-y-px bg-foreground/10">
        {connections.length === 0 ? (
          <div className="p-8 text-center bg-background space-y-4">
            <div className="h-px w-12 bg-foreground/20 mx-auto"></div>
            <div className="text-foreground/60 font-light mb-1">No connections configured</div>
            <div className="text-xs text-foreground/50 font-light">Create a new connection to get started</div>
          </div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className={`p-6 bg-background cursor-pointer transition-colors ${
                selectedConnectionId === conn.id
                  ? 'bg-foreground/5 border-l-4 border-foreground'
                  : 'hover:bg-muted/10'
              }`}
              onClick={() => onSelectConnection(conn.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="font-medium text-foreground">{conn.name}</div>
                    {conn.isConnected ? (
                      <span className="text-xs bg-foreground/10 text-foreground px-3 py-1.5 uppercase tracking-wider font-medium">
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs bg-foreground/10 text-foreground/60 px-3 py-1.5 uppercase tracking-wider font-medium">
                        Disconnected
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/60 font-mono bg-foreground/5 px-3 py-2 border border-foreground/10">
                    {conn.username}@{conn.host}:{conn.port}/{conn.database}
                  </div>
                  {conn.lastError && (
                    <div className="text-xs text-foreground/80 mt-3 border border-foreground/20 p-3 font-light">
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
                    className="px-3 py-1.5 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
                  >
                    Test
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConnection(conn.id);
                    }}
                    className="px-3 py-1.5 border border-foreground/20 text-foreground/60 hover:text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
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
        <div className={`border p-4 ${
          selectedConnectionId 
            ? 'border-foreground/20 bg-foreground/5' 
            : 'border-foreground/10 bg-foreground/5'
        }`}>
          <div className="text-xs text-foreground/80 font-light">
            {selectedConnectionId ? (
              'Connection active • Queries will use this database'
            ) : (
              'Select a connection to enable database-powered queries'
            )}
          </div>
        </div>
      )}
    </div>
  );
}
