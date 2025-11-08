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
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <h2 className="card-header">API Key Configuration</h2>
        <p className="card-subtitle mt-2">
          Configure your Gemini API key to use your own credits. Keys are encrypted and stored securely.
        </p>
      </div>

      {hasKey && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-300 mb-1.5">Active API Key</div>
              <div className="text-xs text-slate-400 font-mono bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50">
                {maskedKey}
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="ml-4 text-sm text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all border border-red-500/20 hover:border-red-500/40 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="text-sm text-slate-300 mb-2.5 block font-semibold">Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="input-field"
            disabled={loading}
          />
          <div className="text-xs text-slate-500 mt-2.5">
            Get your API key from{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Google AI Studio
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !apiKey.trim()}
          className="btn-success w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating & Saving...
            </span>
          ) : hasKey ? (
            'Update API Key'
          ) : (
            'Save API Key'
          )}
        </button>
      </form>
    </div>
  );
}