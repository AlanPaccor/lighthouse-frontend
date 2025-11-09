"use client"

export default function BentoSection() {
  return (
    <section className="py-32 px-6 bg-muted/10">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-20">
          <div className="h-px w-16 bg-foreground mb-4"></div>
          <h2 className="text-5xl md:text-6xl font-light text-foreground mb-6 tracking-tight">
            System
            <br />
            <span className="font-normal">Overview</span>
          </h2>
        </div>

        {/* Architectural grid layout */}
        <div className="grid grid-cols-12 gap-px bg-foreground/10">
          {/* Large card - Main metrics */}
          <div className="col-span-12 lg:col-span-8 bg-background p-12 space-y-8">
            <div className="space-y-2">
              <div className="h-px w-12 bg-foreground"></div>
              <h3 className="text-2xl font-medium text-foreground tracking-tight">
                Performance Metrics
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <div className="text-4xl font-light text-foreground">2.4M</div>
                <div className="text-xs text-foreground/60 uppercase tracking-wider">Requests</div>
                <div className="h-px bg-foreground/10 mt-4"></div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-foreground">$12.8K</div>
                <div className="text-xs text-foreground/60 uppercase tracking-wider">Total Cost</div>
                <div className="h-px bg-foreground/10 mt-4"></div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-foreground">98.2%</div>
                <div className="text-xs text-foreground/60 uppercase tracking-wider">Confidence</div>
                <div className="h-px bg-foreground/10 mt-4"></div>
              </div>
            </div>
          </div>

          {/* Small card - Latency */}
          <div className="col-span-12 lg:col-span-4 bg-background p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-px w-8 bg-foreground"></div>
              <h3 className="text-lg font-medium text-foreground tracking-tight">Latency</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-foreground/60 mb-2 uppercase tracking-wider">
                  <span>P50</span>
                  <span className="text-foreground font-medium">245ms</span>
                </div>
                <div className="h-1 bg-muted/30">
                  <div className="h-full w-2/5 bg-foreground"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-foreground/60 mb-2 uppercase tracking-wider">
                  <span>P95</span>
                  <span className="text-foreground font-medium">890ms</span>
                </div>
                <div className="h-1 bg-muted/30">
                  <div className="h-full w-4/5 bg-foreground"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Small card - Confidence */}
          <div className="col-span-12 lg:col-span-4 bg-background p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-px w-8 bg-foreground"></div>
              <h3 className="text-lg font-medium text-foreground tracking-tight">Confidence</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light text-foreground">95%</span>
                <span className="text-xs text-foreground/60">2,847</span>
              </div>
              <div className="h-px bg-foreground/10"></div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light text-foreground">78%</span>
                <span className="text-xs text-foreground/60">543</span>
              </div>
            </div>
          </div>

          {/* Small card - Cost */}
          <div className="col-span-12 lg:col-span-4 bg-background p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-px w-8 bg-foreground"></div>
              <h3 className="text-lg font-medium text-foreground tracking-tight">Cost</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-foreground/60 mb-2 uppercase tracking-wider">GPT-4</div>
                <div className="text-xl font-light text-foreground">$1,240</div>
              </div>
              <div className="h-px bg-foreground/10"></div>
              <div>
                <div className="text-xs text-foreground/60 mb-2 uppercase tracking-wider">Gemini</div>
                <div className="text-xl font-light text-foreground">$892</div>
              </div>
            </div>
          </div>

          {/* Small card - Status */}
          <div className="col-span-12 lg:col-span-4 bg-background p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-px w-8 bg-foreground"></div>
              <h3 className="text-lg font-medium text-foreground tracking-tight">Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-foreground"></div>
                <span className="text-sm text-foreground/80">All Systems Operational</span>
              </div>
              <div className="h-px bg-foreground/10"></div>
              <div className="text-xs text-foreground/60 uppercase tracking-wider">
                Last updated: 2m ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
