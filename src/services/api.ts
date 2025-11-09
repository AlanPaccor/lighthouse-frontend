// src/services/api.ts
import type { Trace, Stats } from '../types/Trace';
import { supabase } from '../lib/supabase';

// Export BASE_URL for use in other files if needed
export const BASE_URL = 'http://localhost:8080';
export const TRACES_BASE_URL = `${BASE_URL}/api/traces`;
export const DB_CONNECTIONS_BASE_URL = `${BASE_URL}/api/db-connections`;
export const PROJECTS_BASE_URL = `${BASE_URL}/api/projects`;

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured - return headers without auth
    return headers;
  }
  
  if (!supabase) {
    return headers;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error getting session:', error);
      return headers;
    }
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.warn('Error in getAuthHeaders:', error);
  }
  
  return headers;
}

export const api = {
  // Get all traces (with optional project filter)
  getTraces: async (projectId?: string | null): Promise<Trace[]> => {
    const url = projectId 
      ? `${TRACES_BASE_URL}?projectId=${projectId}`
      : TRACES_BASE_URL;
    const headers = await getAuthHeaders();
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch traces');
    return response.json();
  },

  // Execute query (without DB)
  executeQuery: async (prompt: string): Promise<Trace> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${TRACES_BASE_URL}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error('Failed to execute query');
    return response.json();
  },

  // Execute query with database connection
  executeQueryWithDB: async (prompt: string, dbConnectionId: string): Promise<Trace> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${TRACES_BASE_URL}/query-with-db`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt, dbConnectionId }),
    });
    if (!response.ok) throw new Error('Failed to execute query with DB');
    return response.json();
  },

  // Get stats (with optional project filter)
  getStats: async (projectId?: string | null): Promise<Stats> => {
    const url = projectId
      ? `${TRACES_BASE_URL}/stats?projectId=${projectId}`
      : `${TRACES_BASE_URL}/stats`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Clear traces
  clearTraces: async (): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${TRACES_BASE_URL}/clear`, { 
      method: 'DELETE',
      headers 
    });
    if (!response.ok) throw new Error('Failed to clear traces');
  },

  // Check hallucinations for an existing trace
  checkHallucinations: async (traceId: string, dbConnectionId: string): Promise<Trace> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${TRACES_BASE_URL}/${traceId}/check-hallucinations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ dbConnectionId }),
    });
    if (!response.ok) throw new Error('Failed to check hallucinations');
    return response.json();
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
    const headers = await getAuthHeaders();
    const response = await fetch(DB_CONNECTIONS_BASE_URL, { headers });
    if (!response.ok) throw new Error('Failed to fetch connections');
    return response.json();
  },

  // Get single connection
  getById: async (id: string): Promise<DBConnection> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch connection');
    return response.json();
  },

  // Create new connection
  create: async (connection: Omit<DBConnection, 'id' | 'isConnected' | 'lastError' | 'createdAt'> & { password: string }): Promise<DBConnection> => {
    const headers = await getAuthHeaders();
    const response = await fetch(DB_CONNECTIONS_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(connection),
    });
    if (!response.ok) throw new Error('Failed to create connection');
    return response.json();
  },

  // Test connection
  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}/test`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to test connection');
    return response.json();
  },

  // Get tables from connection
  getTables: async (id: string): Promise<string[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}/tables`, { headers });
    if (!response.ok) throw new Error('Failed to fetch tables');
    return response.json();
  },

  // Search database
  search: async (id: string, query: string): Promise<{ results: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search database');
    return response.json();
  },

  // Delete connection
  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${DB_CONNECTIONS_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete connection');
  },
};

// Projects API
export interface Project {
  id: string;
  name: string;
  apiKey: string;
  description?: string;
  createdAt: string;
}

export const projectsApi = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(PROJECTS_BASE_URL, { headers });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to fetch projects:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 403 || response.status === 401) {
          throw new Error('Authentication required. Please configure Supabase or update backend to allow unauthenticated requests.');
        }
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get single project
  getById: async (id: string): Promise<Project> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${PROJECTS_BASE_URL}/${id}`, { headers });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to fetch project:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        if (response.status === 403 || response.status === 401) {
          throw new Error('Authentication required.');
        }
        throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  create: async (project: { name: string; description?: string }): Promise<Project> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(PROJECTS_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(project),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to create project:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestBody: project
        });
        
        if (response.status === 403 || response.status === 401) {
          throw new Error('Authentication required. The backend requires authentication to create projects. Please configure Supabase or update the backend ProjectController to make Authentication optional.');
        }
        throw new Error(`Failed to create project: ${response.status} ${response.statusText}. ${errorText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${PROJECTS_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to delete project:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        if (response.status === 403 || response.status === 401) {
          throw new Error('Authentication required.');
        }
        throw new Error(`Failed to delete project: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
};