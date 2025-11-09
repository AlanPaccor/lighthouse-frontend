"use client"

const stats = [
  { value: "99.9%", label: "Uptime", sublabel: "Last 30 days" },
  { value: "2.4M", label: "Requests", sublabel: "Total processed" },
  { value: "0.2s", label: "Avg Latency", sublabel: "P50 response time" },
  { value: "98.2%", label: "Confidence", sublabel: "Average score" },
]

export default function StatsSection() {
  return (
    <section id="stats" className="py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Architectural grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-background p-8 space-y-4 group hover:bg-muted/10 transition-colors duration-300"
            >
              <div className="text-5xl font-light text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="h-px w-12 bg-foreground/20 group-hover:bg-foreground/40 transition-colors"></div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-xs text-foreground/50 font-light">
                  {stat.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
