// src/components/NotificationSettings.tsx
import { useState, useEffect } from 'react';
import { getAuthHeaders, BASE_URL } from '../services/api';

export default function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/user/preferences`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications ?? true);
      } else if (response.status === 404) {
        // Preferences don't exist yet, use default
        setEmailNotifications(true);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Default to enabled if we can't load
      setEmailNotifications(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    setSaving(true);
    setMessage(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailNotifications: enabled }),
      });
      
      if (response.ok) {
        setEmailNotifications(enabled);
        setMessage({
          type: 'success',
          text: enabled 
            ? 'Email notifications enabled' 
            : 'Email notifications disabled'
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update notification preferences'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-foreground/60 font-light">
          Configure email notifications for hallucination alerts
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-foreground/20 border-t-foreground"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-foreground/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Email Notifications
                </div>
                <div className="text-xs text-foreground/60 font-light leading-relaxed">
                  Receive email alerts when hallucinations are detected (confidence &lt; 50%)
                </div>
                <div className="text-xs text-foreground/50 font-light mt-2">
                  Emails will be sent to your account email address when a query returns a confidence score below 50%
                </div>
              </div>
              <button
                onClick={() => handleToggle(!emailNotifications)}
                disabled={saving}
                className={`ml-6 px-6 py-3 border transition-all duration-300 ${
                  emailNotifications
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground/20 text-foreground hover:border-foreground'
                } text-xs font-medium uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? 'Saving...' : emailNotifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`border p-4 ${
              message.type === 'success'
                ? 'border-foreground/20 bg-foreground/5'
                : 'border-foreground/20 bg-foreground/5'
            }`}>
              <div className={`text-xs font-light ${
                message.type === 'success' 
                  ? 'text-foreground/80' 
                  : 'text-foreground/80'
              }`}>
                {message.text}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

