import type { Trace } from '../types/Trace';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

interface ConfidenceChartProps {
  traces: Trace[];
}

export default function ConfidenceChart({ traces }: ConfidenceChartProps) {
  const tracesWithConfidence = traces.filter(t => t.confidenceScore !== undefined && t.confidenceScore !== null);
  
  const chartData = tracesWithConfidence
    .slice(0, 30)
    .reverse()
    .map((trace, index) => {
      const confidence = trace.confidenceScore || 100;
      return {
        index: index + 1,
        confidence: confidence,
        timestamp: new Date(trace.createdAt).toLocaleTimeString(),
      };
    });

  const calculateHealthMetrics = () => {
    if (chartData.length === 0) {
      return {
        averageConfidence: 100,
        trend: 0,
        healthScore: 100,
        healthStatus: 'excellent',
        recentAverage: 100,
      };
    }

    const allConfidences = chartData.map(d => d.confidence);
    const averageConfidence = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
    
    const midPoint = Math.floor(allConfidences.length / 2);
    const firstHalf = allConfidences.slice(0, midPoint);
    const secondHalf = allConfidences.slice(midPoint);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : averageConfidence;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : averageConfidence;
    const trend = secondAvg - firstAvg;
    
    const recentConfidences = allConfidences.slice(-5);
    const recentAverage = recentConfidences.length > 0 
      ? recentConfidences.reduce((a, b) => a + b, 0) / recentConfidences.length 
      : averageConfidence;
    
    const trendBonus = Math.min(Math.max(trend * 0.5, -10), 10);
    const healthScore = Math.min(Math.max(
      (recentAverage * 0.6) + (averageConfidence * 0.3) + trendBonus,
      0
    ), 100);
    
    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (healthScore >= 85) healthStatus = 'excellent';
    else if (healthScore >= 70) healthStatus = 'good';
    else if (healthScore >= 55) healthStatus = 'fair';
    else healthStatus = 'poor';
    
    return {
      averageConfidence,
      trend,
      healthScore,
      healthStatus,
      recentAverage,
    };
  };

  const metrics = calculateHealthMetrics();

  return (
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="space-y-4">
        <div className="h-px w-16 bg-foreground"></div>
        <h2 className="text-3xl font-light text-foreground tracking-tight">Confidence Analytics</h2>
        <p className="text-sm text-foreground/60 font-light">
          Hallucination detection confidence over time
        </p>
      </div>

      {/* Health Score Indicator */}
      <div className="border border-foreground/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">
            System Health Score
          </div>
          <div className="text-3xl font-light text-foreground">
            {metrics.healthScore.toFixed(1)}%
          </div>
        </div>
        <div className="h-px bg-foreground/10"></div>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-foreground/50 mb-1 uppercase tracking-wider font-light">Status</div>
            <div className="font-medium text-foreground capitalize">
              {metrics.healthStatus}
            </div>
          </div>
          <div>
            <div className="text-foreground/50 mb-1 uppercase tracking-wider font-light">Avg Confidence</div>
            <div className="font-medium text-foreground">
              {metrics.averageConfidence.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-foreground/50 mb-1 uppercase tracking-wider font-light">Trend</div>
            <div className="font-medium text-foreground">
              {metrics.trend >= 0 ? '↑' : '↓'} {Math.abs(metrics.trend).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-foreground/50 mb-1 uppercase tracking-wider font-light">Recent (5)</div>
            <div className="font-medium text-foreground">
              {metrics.recentAverage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-foreground/60 space-y-4">
          <div className="h-px w-12 bg-foreground/20"></div>
          <div className="font-light">No confidence data available</div>
          <div className="text-xs text-foreground/50 font-light">Execute queries with database connections to see confidence scores</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground)" opacity={0.1} />
            <XAxis 
              dataKey="index" 
              stroke="var(--foreground)" 
              opacity={0.6}
              style={{ fontSize: '11px', fontWeight: 300 }}
              tick={{ fill: 'var(--foreground)', opacity: 0.6 }}
            />
            <YAxis 
              domain={[0, 100]}
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
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Confidence']}
            />
            <ReferenceLine y={80} stroke="var(--foreground)" strokeDasharray="3 3" opacity={0.3} />
            <ReferenceLine y={60} stroke="var(--foreground)" strokeDasharray="3 3" opacity={0.3} />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="var(--foreground)"
              strokeWidth={2}
              fill="url(#confidenceGradient)"
              name="Confidence %"
              dot={{ fill: 'var(--foreground)', r: 3, strokeWidth: 1, stroke: 'var(--background)' }}
              activeDot={{ r: 5, strokeWidth: 1, stroke: 'var(--background)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
