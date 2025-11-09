// src/components/StatsPanel.tsx
import type { Stats } from '../types/Trace';

interface StatsPanelProps {
  stats: Stats | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/10">
      {/* Total Cost */}
      <div className="bg-background p-8 space-y-4 group hover:bg-muted/10 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="h-px w-12 bg-foreground/20 group-hover:bg-foreground/40 transition-colors"></div>
          <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Total Cost</div>
        </div>
        <div className="text-5xl font-light text-foreground tracking-tight">
          ${(stats.totalCost || 0).toFixed(4)}
        </div>
        <div className="h-px w-16 bg-foreground/10"></div>
        <div className="text-xs text-foreground/50 font-light">
          Cumulative spend across all queries
        </div>
      </div>

      {/* Total Requests */}
      <div className="bg-background p-8 space-y-4 group hover:bg-muted/10 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="h-px w-12 bg-foreground/20 group-hover:bg-foreground/40 transition-colors"></div>
          <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Total Requests</div>
        </div>
        <div className="text-5xl font-light text-foreground tracking-tight">
          {stats.totalRequests || 0}
        </div>
        <div className="h-px w-16 bg-foreground/10"></div>
        <div className="text-xs text-foreground/50 font-light">
          AI queries processed and tracked
        </div>
      </div>

      {/* Average Latency */}
      <div className="bg-background p-8 space-y-4 group hover:bg-muted/10 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="h-px w-12 bg-foreground/20 group-hover:bg-foreground/40 transition-colors"></div>
          <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Avg Latency</div>
        </div>
        <div className="text-5xl font-light text-foreground tracking-tight">
          {stats.averageLatency ? Math.round(stats.averageLatency) : 0}<span className="text-2xl">ms</span>
        </div>
        <div className="h-px w-16 bg-foreground/10"></div>
        <div className="text-xs text-foreground/50 font-light">
          Mean response time per query
        </div>
      </div>
    </div>
  );
}
