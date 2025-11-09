import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthComponentProps {
  onBack?: () => void
  onBypassAuth?: () => void
}

export default function AuthComponent({ onBack, onBypassAuth }: AuthComponentProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Show configuration message if Supabase isn't set up
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="h-px w-16 bg-foreground"></div>
            <h1 className="text-5xl font-light text-foreground tracking-tight">
              Lighthouse
            </h1>
            <p className="text-sm text-foreground/60 uppercase tracking-wider">
              AI Observability Platform
            </p>
          </div>

          {/* Warning */}
          <div className="border border-foreground/20 p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground uppercase tracking-wider">
                Supabase Not Configured
              </p>
              <p className="text-xs text-foreground/60 font-light leading-relaxed">
                To enable authentication, please configure Supabase environment variables.
                See SUPABASE_SETUP.md for instructions.
              </p>
            </div>
          </div>

          {/* Bypass button */}
          {onBypassAuth && (
            <div className="space-y-4">
              <p className="text-xs text-foreground/50 font-light">
                For development, you can access the dashboard directly:
              </p>
              <button
                onClick={onBypassAuth}
                className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90"
              >
                <span className="relative z-10">Continue to Dashboard</span>
                <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          )}

          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!supabase) {
      setError('Supabase is not configured')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        // Success - auth context will handle redirect
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-12">
        {/* Header */}
        <div className="space-y-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider mb-8"
            >
              ← Back to Home
            </button>
          )}
          
          <div className="h-px w-16 bg-foreground"></div>
          <h1 className="text-5xl font-light text-foreground tracking-tight">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>
          <p className="text-sm text-foreground/60 uppercase tracking-wider">
            Lighthouse AI Observability
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs text-foreground/60 uppercase tracking-wider font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-foreground/60 uppercase tracking-wider font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="border border-foreground/20 p-4">
              <p className="text-xs text-foreground/80 font-light">{error}</p>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="border border-foreground/20 p-4">
              <p className="text-xs text-foreground/80 font-light">{message}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </span>
            {!loading && (
              <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
            )}
          </button>

          {/* Toggle sign up/sign in */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="text-xs text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
