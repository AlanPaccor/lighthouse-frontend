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
    confidenceScore?: number;
    hallucinationData?: string; // Changed to string - it's stored as JSON
  }
  
  export interface Stats {
    totalCost: number;
    totalRequests: number;
    averageLatency: number;
  }
  
  export interface HallucinationResult {
    confidenceScore: number;
    unsupportedClaims: string[];
    supportedClaims: string[];
    aiReview: string;
    hasHallucinations: boolean;
  }