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
    <div className="glass-card rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🔌 Database Connections
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 font-medium text-sm"
        >
          {showForm ? 'Cancel' : '+ Connect Database'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-900/50 p-5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
          <input
            type="text"
            placeholder="Connection Name (e.g., Production DB)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Host (e.g., localhost)"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
              required
            />
            <input
              type="number"
              placeholder="Port"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Database Name"
            value={formData.database}
            onChange={(e) => setFormData({ ...formData, database: e.target.value })}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 py-3 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 disabled:shadow-none font-medium text-sm"
          >
            {loading ? 'Testing Connection...' : 'Connect & Test'}
          </button>
        </form>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔌</div>
            <div className="text-gray-400">No database connections yet. Add one to get started!</div>
          </div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className={`bg-gray-900/50 p-5 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] ${
                selectedConnectionId === conn.id
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-gray-700/50 hover:border-gray-600'
              }`}
              onClick={() => onSelectConnection(conn.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-white">{conn.name}</div>
                    {conn.isConnected ? (
                      <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full font-medium shadow-md">
                        ✓ Connected
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full font-medium shadow-md">
                        ✗ Disconnected
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {conn.username}@{conn.host}:{conn.port}/{conn.database}
                  </div>
                  {conn.lastError && (
                    <div className="text-xs text-red-400 mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
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
                    className="text-xs bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all shadow-md hover:shadow-blue-500/50 font-medium"
                  >
                    Test
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConnection(conn.id);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
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
        <div className={`mt-5 text-sm p-3 rounded-lg border ${
          selectedConnectionId 
            ? 'bg-green-500/10 border-green-500/30 text-green-300' 
            : 'bg-gray-900/50 border-gray-700/50 text-gray-400'
        }`}>
          {selectedConnectionId ? '✓ Connection selected for queries' : 'Select a connection to use for AI queries'}
        </div>
      )}
    </div>
  );
}