// src/components/CostChart.tsx
import type { Trace } from '../types/Trace';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CostChartProps {
  traces: Trace[];
}

export default function CostChart({ traces }: CostChartProps) {
  const chartData = traces
    .slice(0, 20)
    .reverse()
    .map((trace, index) => ({
      index: index + 1,
      cost: trace.costUsd * 1000000,
      latency: trace.latencyMs,
    }));

  return (
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="space-y-4">
        <div className="h-px w-16 bg-foreground"></div>
        <h2 className="text-3xl font-light text-foreground tracking-tight">Cost Analytics</h2>
        <p className="text-sm text-foreground/60 font-light">
          Track query costs over time (last 20 queries)
        </p>
      </div>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-foreground/60 space-y-4">
          <div className="h-px w-12 bg-foreground/20"></div>
          <div className="font-light">No data available</div>
          <div className="text-xs text-foreground/50 font-light">Execute queries to see cost trends</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground)" opacity={0.1} />
            <XAxis 
              dataKey="index" 
              stroke="var(--foreground)" 
              opacity={0.6}
              style={{ fontSize: '11px', fontWeight: 300 }}
              tick={{ fill: 'var(--foreground)', opacity: 0.6 }}
            />
            <YAxis 
              stroke="var(--foreground)" 
              opacity={0.6}
              style={{ fontSize: '11px', fontWeight: 300 }}
              tick={{ fill: 'var(--foreground)', opacity: 0.6 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                border: '1px solid var(--foreground)',
                borderOpacity: 0.2,
                borderRadius: '0',
                color: 'var(--foreground)'
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 400, fontSize: '12px' }}
              itemStyle={{ color: 'var(--foreground)', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              stroke="var(--foreground)" 
              strokeWidth={2} 
              name="Cost (μ$)"
              dot={{ fill: 'var(--foreground)', r: 3, strokeWidth: 1, stroke: 'var(--background)' }}
              activeDot={{ r: 5, strokeWidth: 1, stroke: 'var(--background)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
