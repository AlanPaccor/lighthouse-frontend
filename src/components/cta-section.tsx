"use client"

interface CtaSectionProps {
  onNavigateToAuth?: () => void;
}

export default function CtaSection({ onNavigateToAuth }: CtaSectionProps) {
  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToAuth) {
      onNavigateToAuth();
    }
  };

  return (
    <section className="py-32 px-6 bg-foreground text-background">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left - Content */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="h-px w-16 bg-background/30"></div>
            <h2 className="text-5xl md:text-6xl font-light text-background leading-tight tracking-tight">
              Ready to
              <br />
              <span className="font-normal">Get Started?</span>
            </h2>
            <p className="text-lg text-background/80 max-w-xl font-light">
              Join teams building reliable AI systems. Start monitoring in minutes.
            </p>
          </div>

          {/* Right - CTA */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-4 bg-background text-foreground font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-background/90"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 border border-background translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <a
              href="#features"
              className="px-8 py-4 border border-background/30 text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:border-background text-center"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
