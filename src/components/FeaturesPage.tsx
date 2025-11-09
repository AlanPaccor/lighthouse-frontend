import Header from './header';
import Footer from './footer';

export default function FeaturesPage({ onNavigateToAuth }: { onNavigateToAuth?: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigateToAuth={onNavigateToAuth} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {/* Hero Section */}
          <section className="space-y-8">
            <div className="h-px w-16 bg-foreground"></div>
            <h1 className="text-5xl font-light text-foreground tracking-tight">
              Features
            </h1>
            <p className="text-lg text-foreground/60 font-light max-w-2xl">
              Comprehensive AI observability tools to monitor, analyze, and optimize your AI applications
            </p>
          </section>

          {/* Features Grid */}
          <section className="space-y-16">
            {/* Real-time Monitoring */}
            <div className="space-y-6">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Real-time Monitoring</h2>
              <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Query Tracking</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Track every AI query in real-time with detailed metrics including latency, token usage, and cost. View complete query history with searchable prompts and responses.
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Performance Metrics</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Monitor average latency, total requests, and cumulative costs across all your AI operations. Get instant insights into your system's performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Hallucination Detection */}
            <div className="space-y-6">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Hallucination Detection</h2>
              <div className="grid md:grid-cols-3 gap-px bg-foreground/10">
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Confidence Scoring</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Advanced algorithm analyzes AI responses against your database context to calculate confidence scores. Get clear indicators: Supported (75-100%), Warning (50-75%), or Hallucination Detected (0-50%).
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">AI-Powered Review</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Automatic AI review of responses identifies unsupported claims and provides detailed explanations. See exactly which statements need verification.
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Email Notifications</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Get instant email alerts when hallucinations are detected (confidence below 50%). Stay informed about low-confidence responses even when you're away from the dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Database Integration */}
            <div className="space-y-6">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Database Integration</h2>
              <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">RAG Support</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Connect PostgreSQL databases to enhance AI queries with Retrieval Augmented Generation. Browse tables, schemas, and query data directly from the dashboard.
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Context-Aware Queries</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Automatically enrich AI prompts with relevant database context. Improve response accuracy by grounding AI in your actual data.
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics & Visualization */}
            <div className="space-y-6">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Analytics & Visualization</h2>
              <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Cost Analytics</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Track AI API costs over time with detailed charts. Monitor spending patterns and optimize usage to reduce expenses.
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">System Health Score</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Get a comprehensive health score based on confidence trends, recent performance, and overall system reliability. Visualize confidence over time with interactive charts.
                  </p>
                </div>
              </div>
            </div>

            {/* Developer SDK */}
            <div className="space-y-6">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Developer SDK</h2>
              <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Easy Integration</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Wrap your AI API calls with our lightweight SDK to automatically track all queries. Works with any AI provider - OpenAI, Anthropic, Google Gemini, and more.
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Multi-Project Support</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Organize your AI operations into projects with unique API keys. Monitor different applications, environments, or teams separately.
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Authentication */}
            <div className="space-y-6">
              <div className="h-px w-12 bg-foreground"></div>
              <h2 className="text-3xl font-light text-foreground tracking-tight">Security & Authentication</h2>
              <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">Secure API Keys</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    API keys are encrypted and stored securely. Each project gets a unique API key for SDK integration. Keys can be rotated or revoked at any time.
                  </p>
                </div>
                <div className="bg-background p-8 space-y-4">
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">User Authentication</div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    Optional Supabase authentication for production deployments. Development mode allows quick setup without authentication requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

