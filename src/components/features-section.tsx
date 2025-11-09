"use client"

const features = [
  {
    title: "Real-time Monitoring",
    description: "Track latency, costs, and token usage across all AI API calls with millisecond precision.",
  },
  {
    title: "Hallucination Detection",
    description: "Validate AI responses against database context with confidence scoring (0-100%). Receive instant email alerts when confidence drops below 50%.",
  },
  {
    title: "Cost Analytics",
    description: "Monitor spending per model, provider, and project with detailed breakdowns.",
  },
  {
    title: "Database Integration",
    description: "Connect PostgreSQL databases for context-aware validation and RAG workflows.",
  },
  {
    title: "Multi-Project Support",
    description: "Manage multiple projects with isolated traces and team-based access controls.",
  },
  {
    title: "Lightweight SDK",
    description: "Simple integration with minimal overhead for production AI systems.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section header - Architectural */}
        <div className="mb-20">
          <div className="h-px w-16 bg-foreground mb-4"></div>
          <h2 className="text-5xl md:text-6xl font-light text-foreground mb-6 tracking-tight">
            Core
            <br />
            <span className="font-normal">Capabilities</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl font-light">
            Enterprise features designed for reliability and scale
          </p>
        </div>

        {/* Grid layout - Architectural */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background p-8 space-y-4 group hover:bg-muted/20 transition-colors duration-300"
            >
              {/* Number indicator */}
              <div className="flex items-center gap-4">
                <span className="text-2xl font-light text-foreground/40">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="h-px flex-1 bg-foreground/10 group-hover:bg-foreground/30 transition-colors"></div>
              </div>
              
              <h3 className="text-xl font-medium text-foreground tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
