interface LandingPageProps {
  onNavigateToAuth: () => void
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-6xl sm:text-7xl font-bold mb-6">
              <span className="gradient-text">Lighthouse</span>
            </h1>
            <p className="text-2xl sm:text-3xl text-slate-300 mb-4 font-semibold">
              AI Observability Platform
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
              Monitor, detect, and prevent AI hallucinations in production. 
              Real-time confidence scoring, cost tracking, and enterprise-grade reliability 
              for your LLM applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Get Started button clicked');
                  onNavigateToAuth();
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Sign In button clicked');
                  onNavigateToAuth();
                }}
                className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Hallucination Detection</h3>
            <p className="text-slate-400">
              Automatically validate AI responses against your database. Get confidence scores 
              and real-time warnings for unsupported claims.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-Time Monitoring</h3>
            <p className="text-slate-400">
              Track costs, latency, and token usage across all your AI queries. 
              Visualize trends and optimize your AI spending.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Enterprise Ready</h3>
            <p className="text-slate-400">
              Multi-project support, API keys, SDK integration. Built for teams 
              that need production-grade AI observability.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">100%</div>
            <div className="text-slate-400">Confidence Scoring</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-400 mb-2">Real-Time</div>
            <div className="text-slate-400">Monitoring</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">Auto</div>
            <div className="text-slate-400">Detection</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400 mb-2">Enterprise</div>
            <div className="text-slate-400">Grade</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Trust Your AI?</h2>
        <p className="text-xl text-slate-400 mb-8">
          Start monitoring your AI applications today. No credit card required.
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log('Get Started Free button clicked');
            onNavigateToAuth();
          }}
          className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-lg"
        >
          Get Started Free
        </button>
      </div>
    </div>
  )
}

