// src/services/api.ts
import type { Trace, Stats } from '../types/Trace';

// Export BASE_URL for use in other files if needed
export const BASE_URL = 'http://localhost:8080';
export const TRACES_BASE_URL = `${BASE_URL}/api/traces`;
export const DB_CONNECTIONS_BASE_URL = `${BASE_URL}/api/db-connections`;

export const api = {
  // Get all traces
  getTraces: async (): Promise<Trace[]> => {
    const response = await fetch(TRACES_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch traces');
    return response.json();
  },

  // Execute query (without DB)
  executeQuery: async (prompt: string): Promise<Trace> => {
    const response = await fetch(`${TRACES_BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error('Failed to execute query');
    return response.json();
  },

  // Execute query with database connection
  executeQueryWithDB: async (prompt: string, dbConnectionId: string): Promise<Trace> => {
    const response = await fetch(`${TRACES_BASE_URL}/query-with-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, dbConnectionId }),
    });
    if (!response.ok) throw new Error('Failed to execute query with DB');
    return response.json();
  },

  // Get stats
  getStats: async (): Promise<Stats> => {
    const response = await fetch(`${TRACES_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Clear traces
  clearTraces: async (): Promise<void> => {
    const response = await fetch(`${TRACES_BASE_URL}/clear`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear traces');
  },
};

// Database Connections API
export interface DBConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  isConnected: boolean;
  lastError?: string;
  createdAt: string;
}

export const dbConnectionsApi = {
  // Get all connections
  getAll: async (): Promise<DBConnection[]> => {
    const response = await fetch(DB_CONNECTIONS_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch connections');
    return response.json();
  },

  // Get single connection
  getById: async (id: string): Promise<DBConnection> => {
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch connection');
    return response.json();
  },

  // Create new connection
  create: async (connection: Omit<DBConnection, 'id' | 'isConnected' | 'lastError' | 'createdAt'> & { password: string }): Promise<DBConnection> => {
    const response = await fetch(DB_CONNECTIONS_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection),
    });
    if (!response.ok) throw new Error('Failed to create connection');
    return response.json();
  },

  // Test connection
  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}/test`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to test connection');
    return response.json();
  },

  // Get tables from connection
  getTables: async (id: string): Promise<string[]> => {
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}/tables`);
    if (!response.ok) throw new Error('Failed to fetch tables');
    return response.json();
  },

  // Search database
  search: async (id: string, query: string): Promise<{ results: string }> => {
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search database');
    return response.json();
  },

  // Delete connection
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete connection');
  },
};