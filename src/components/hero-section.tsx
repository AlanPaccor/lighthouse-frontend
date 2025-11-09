"use client"

interface HeroSectionProps {
  onNavigateToAuth?: () => void;
}

export default function HeroSection({ onNavigateToAuth }: HeroSectionProps) {
  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToAuth) {
      onNavigateToAuth();
    }
  };

  return (
    <section className="pt-40 pb-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Architectural grid layout */}
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left column - Content */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* Badge */}
            <div className="inline-block">
              <div className="h-px w-16 bg-foreground mb-2"></div>
              <span className="text-xs tracking-widest uppercase text-foreground/60 font-medium">
                AI Observability
              </span>
            </div>

            {/* Main heading - Architectural typography */}
            <h1 className="text-6xl md:text-7xl font-light text-foreground leading-[1.1] tracking-tight">
              Monitor
              <br />
              <span className="font-normal">Validate</span>
              <br />
              <span className="font-light text-foreground/80">Optimize</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-foreground/70 max-w-xl leading-relaxed font-light">
              Enterprise-grade observability platform for AI systems. 
              Track performance, detect hallucinations, and ensure reliability.
            </p>

            {/* CTA Buttons - Minimal design */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <a
                href="#features"
                className="px-8 py-4 border border-foreground/20 text-foreground font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right column - Architectural visual element */}
          <div className="col-span-12 lg:col-span-5 relative">
            <div className="relative aspect-square bg-muted/30">
              {/* Geometric grid pattern */}
              <div className="absolute inset-0 grid grid-cols-4 gap-px p-8">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square ${
                      i % 5 === 0 || i % 7 === 0
                        ? 'bg-foreground/10'
                        : 'bg-transparent'
                    } transition-all duration-500 hover:bg-foreground/20`}
                  ></div>
                ))}
              </div>
              
              {/* Overlay metrics - Architectural typography */}
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-light text-foreground">99.9%</span>
                  <span className="text-sm text-foreground/60 uppercase tracking-wider">Uptime</span>
                </div>
                <div className="h-px bg-foreground/20"></div>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-light text-foreground">0.2s</span>
                  <span className="text-sm text-foreground/60 uppercase tracking-wider">Avg Latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
