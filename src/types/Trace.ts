// src/types/Trace.ts
export interface Trace {
    id: string;
    prompt: string;
    response: string;
    tokensUsed: number;
    costUsd: number;
    latencyMs: number;
    provider: string;
    createdAt: string;
  }
  
  export interface Stats {
    totalCost: number;
    totalRequests: number;
    averageLatency: number;
  }