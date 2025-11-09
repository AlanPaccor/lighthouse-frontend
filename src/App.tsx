import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthComponent from './components/Auth';
import Dashboard from './components/Dashboard';
import FeaturesPage from './components/FeaturesPage';
import DocsPage from './components/DocsPage';

type View = 'landing' | 'auth' | 'dashboard' | 'features' | 'docs';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>(() => {
    // Check URL hash for routing
    const hash = window.location.hash.slice(1);
    if (hash === 'features') return 'features';
    if (hash === 'docs') return 'docs';
    return 'landing';
  });

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'features') setCurrentView('features');
      else if (hash === 'docs') setCurrentView('docs');
      else if (hash === 'dashboard') setCurrentView('dashboard');
      else if (hash === 'auth') setCurrentView('auth');
      else setCurrentView('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check if Supabase is configured
  const supabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Debug logging
  useEffect(() => {
    console.log('Current view changed to:', currentView);
  }, [currentView]);

  // Automatically navigate to dashboard when user logs in
  useEffect(() => {
    if (user && currentView !== 'dashboard') {
      setCurrentView('dashboard');
    } else if (!user && !authLoading && currentView === 'dashboard' && supabaseConfigured) {
      // Only redirect to landing if Supabase is configured (auth is required)
      setCurrentView('landing');
    }
  }, [user, authLoading, currentView, supabaseConfigured]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-400 mb-6"></div>
          <div className="text-white text-xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  // Render based on current view
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onNavigateToAuth={() => {
          console.log('Navigate to auth clicked, supabaseConfigured:', supabaseConfigured);
          if (supabaseConfigured) {
            console.log('Setting view to auth');
            setCurrentView('auth');
          } else {
            // If Supabase not configured, go directly to dashboard (dev mode)
            console.log('Setting view to dashboard (dev mode)');
            setCurrentView('dashboard');
          }
        }} 
      />
    );
  }

  if (currentView === 'features') {
    return (
      <FeaturesPage 
        onNavigateToAuth={() => {
          if (supabaseConfigured) {
            setCurrentView('auth');
          } else {
            setCurrentView('dashboard');
          }
        }} 
      />
    );
  }

  if (currentView === 'docs') {
    return (
      <DocsPage 
        onNavigateToAuth={() => {
          if (supabaseConfigured) {
            setCurrentView('auth');
          } else {
            setCurrentView('dashboard');
          }
        }} 
      />
    );
  }

  if (currentView === 'auth') {
    console.log('Rendering auth view');
    return (
      <AuthComponent 
        onBack={() => {
          console.log('Back to landing clicked');
          setCurrentView('landing');
        }}
        onBypassAuth={() => {
          console.log('Bypass auth clicked');
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // Dashboard view (user is authenticated or auth bypassed in dev mode)
  console.log('Rendering dashboard view');
  try {
    return <Dashboard />;
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-slate-400 mb-4">{String(error)}</p>
          <button
            onClick={() => setCurrentView('landing')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
}

export default App;