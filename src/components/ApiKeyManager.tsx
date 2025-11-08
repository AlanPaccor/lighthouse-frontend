// src/components/ApiKeyManager.tsx
import { useState, useEffect } from 'react';

export default function ApiKeyManager() {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    loadCredential();
  }, []);

  const loadCredential = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/credentials/gemini');
      const data = await response.json();
      if (data.exists) {
        setHasKey(true);
        setMaskedKey(data.apiKeyMasked || '****');
        setMessage({
          type: data.isActive ? 'success' : 'error',
          text: data.isActive ? 'API key is configured and active' : 'API key verification failed'
        });
      }
    } catch (error) {
      console.error('Failed to load credential:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8080/api/credentials/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: data.isValid ? 'success' : 'error',
          text: data.message
        });
        setApiKey('');
        loadCredential();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete API key? Queries will use the default key.')) return;

    try {
      await fetch('http://localhost:8080/api/credentials/gemini', {
        method: 'DELETE',
      });
      setHasKey(false);
      setMaskedKey('');
      setMessage({ type: 'success', text: 'API key deleted' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete API key' });
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        🔑 API Key Settings
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Add your own Gemini API key to use your own credits. Your key is stored securely and only used for your queries.
      </p>

      {hasKey && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-300">Current Key</div>
              <div className="text-xs text-gray-400 font-mono mt-1">{maskedKey}</div>
            </div>
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key (starts with AIza...)"
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
            disabled={loading}
          />
          <div className="text-xs text-gray-500 mt-1">
            Get your key from{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Google AI Studio
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !apiKey.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 disabled:shadow-none"
        >
          {loading ? 'Testing & Saving...' : hasKey ? 'Update API Key' : 'Save API Key'}
        </button>
      </form>
    </div>
  );
}