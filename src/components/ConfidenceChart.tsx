import type { Trace } from '../types/Trace';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

interface ConfidenceChartProps {
  traces: Trace[];
}

export default function ConfidenceChart({ traces }: ConfidenceChartProps) {
  // Filter traces that have confidence scores
  const tracesWithConfidence = traces.filter(t => t.confidenceScore !== undefined && t.confidenceScore !== null);
  
  // Prepare data for chart (last 30 traces with confidence)
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

  // Algorithm: Calculate health metrics
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
    
    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(allConfidences.length / 2);
    const firstHalf = allConfidences.slice(0, midPoint);
    const secondHalf = allConfidences.slice(midPoint);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : averageConfidence;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : averageConfidence;
    const trend = secondAvg - firstAvg; // Positive = improving, Negative = declining
    
    // Recent average (last 5)
    const recentConfidences = allConfidences.slice(-5);
    const recentAverage = recentConfidences.length > 0 
      ? recentConfidences.reduce((a, b) => a + b, 0) / recentConfidences.length 
      : averageConfidence;
    
    // Health score algorithm: weighted combination
    // 60% recent average, 30% overall average, 10% trend bonus
    const trendBonus = Math.min(Math.max(trend * 0.5, -10), 10); // Cap trend impact
    const healthScore = Math.min(Math.max(
      (recentAverage * 0.6) + (averageConfidence * 0.3) + trendBonus,
      0
    ), 100);
    
    // Determine health status
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

  // Get color based on health status
  const getHealthColor = () => {
    switch (metrics.healthStatus) {
      case 'excellent': return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', gradient: ['#10b981', '#34d399'] };
      case 'good': return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', gradient: ['#3b82f6', '#60a5fa'] };
      case 'fair': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', gradient: ['#eab308', '#facc15'] };
      case 'poor': return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', gradient: ['#ef4444', '#f87171'] };
    }
  };

  const healthColors = getHealthColor();

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <h2 className="card-header">Confidence Analytics</h2>
        <p className="card-subtitle mt-2">
          Hallucination detection confidence over time
        </p>
      </div>

      {/* Health Score Indicator */}
      <div className={`mb-6 p-4 rounded-xl border ${healthColors.border} ${healthColors.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            System Health Score
          </div>
          <div className={`text-2xl font-bold ${healthColors.text}`}>
            {metrics.healthScore.toFixed(1)}%
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex-1">
            <div className="text-slate-400 mb-1">Status</div>
            <div className={`font-semibold ${healthColors.text} capitalize`}>
              {metrics.healthStatus}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-slate-400 mb-1">Avg Confidence</div>
            <div className="text-slate-300 font-semibold">
              {metrics.averageConfidence.toFixed(1)}%
            </div>
          </div>
          <div className="flex-1">
            <div className="text-slate-400 mb-1">Trend</div>
            <div className={`font-semibold ${metrics.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.trend >= 0 ? '↑' : '↓'} {Math.abs(metrics.trend).toFixed(1)}%
            </div>
          </div>
          <div className="flex-1">
            <div className="text-slate-400 mb-1">Recent (5)</div>
            <div className="text-slate-300 font-semibold">
              {metrics.recentAverage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="font-medium">No confidence data available</div>
          <div className="text-xs text-slate-500 mt-1">Execute queries with database connections to see confidence scores</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={healthColors.gradient[0]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={healthColors.gradient[0]} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
            <XAxis 
              dataKey="index" 
              stroke="#94a3b8" 
              style={{ fontSize: '11px', fontWeight: 500 }}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#94a3b8" 
              style={{ fontSize: '11px', fontWeight: 500 }}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#cbd5e1', fontWeight: 600, fontSize: '12px' }}
              itemStyle={{ color: healthColors.text, fontSize: '12px' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Confidence']}
            />
            {/* Reference lines for thresholds */}
            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} label={{ value: "Excellent", position: "right", fill: "#10b981", fontSize: 10 }} />
            <ReferenceLine y={60} stroke="#eab308" strokeDasharray="3 3" opacity={0.5} label={{ value: "Fair", position: "right", fill: "#eab308", fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke={healthColors.gradient[0]}
              strokeWidth={3}
              fill="url(#confidenceGradient)"
              name="Confidence %"
              dot={{ fill: healthColors.gradient[0], r: 4, strokeWidth: 2, stroke: '#1e293b' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#1e293b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
