// src/services/api.ts
import type { Trace, Stats } from '../types/Trace';

const BASE_URL = 'http://localhost:8080/api/traces';

export const api = {
  // Get all traces
  getTraces: async (): Promise<Trace[]> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch traces');
    return response.json();
  },

  // Execute query
  executeQuery: async (prompt: string): Promise<Trace> => {
    const response = await fetch(`${BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error('Failed to execute query');
    return response.json();
  },

  // Get stats
  getStats: async (): Promise<Stats> => {
    const response = await fetch(`${BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Clear traces
  clearTraces: async (): Promise<void> => {
    const response = await fetch(`${BASE_URL}/clear`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear traces');
  },
};