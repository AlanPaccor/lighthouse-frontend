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
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="space-y-4">
        <div className="h-px w-16 bg-foreground"></div>
        <h2 className="text-3xl font-light text-foreground tracking-tight">API Key Configuration</h2>
        <p className="text-sm text-foreground/60 font-light">
          Configure your Gemini API key to use your own credits. Keys are encrypted and stored securely.
        </p>
      </div>

      {hasKey && (
        <div className="border border-foreground/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Active API Key</div>
              <div className="text-sm font-mono text-foreground bg-foreground/5 px-4 py-3 border border-foreground/10">
                {maskedKey}
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="ml-4 px-4 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`border p-4 ${
          message.type === 'success'
            ? 'border-foreground/20 bg-foreground/5'
            : 'border-foreground/20 bg-foreground/5'
        }`}>
          <div className="text-xs text-foreground/80 font-light">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
            disabled={loading}
          />
          <div className="text-xs text-foreground/50 font-light">
            Get your API key from{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-foreground underline"
            >
              Google AI Studio
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !apiKey.trim()}
          className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {loading ? 'Validating & Saving...' : hasKey ? 'Update API Key' : 'Save API Key'}
          </span>
          {!loading && (
            <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
          )}
        </button>
      </form>
    </div>
  );
}
