// src/components/ProjectManager.tsx
import { useState, useEffect } from 'react';
import { projectsApi, type Project } from '../services/api';

interface ProjectManagerProps {
  onSelectProject?: (projectId: string | null) => void;
  selectedProjectId?: string | null;
}

export default function ProjectManager({ onSelectProject, selectedProjectId }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      // Don't show alert for auth errors - they're expected when Supabase isn't configured
      if (!error.message?.includes('Authentication required')) {
        // Only show alert for unexpected errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const newProject = await projectsApi.create({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
      });
      setProjects([newProject, ...projects]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      const errorMessage = error.message || 'Failed to create project. Please try again.';
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return;
    }

    try {
      await projectsApi.delete(id);
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProjectId === id && onSelectProject) {
        onSelectProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(apiKey);
    setTimeout(() => setCopiedApiKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 shadow-xl">
        <div className="text-center text-slate-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="card-header">Projects</h2>
          <p className="card-subtitle mt-2">
            Manage your projects and API keys for SDK integration
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateProject} className="mb-6 p-6 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block font-semibold">
                Project Name *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="input-field"
                placeholder="My AI Project"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block font-semibold">
                Description (optional)
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="input-field"
                placeholder="Project description..."
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newProjectName.trim()}
              className="btn-success w-full"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {/* All Projects Option */}
        <div
          onClick={() => onSelectProject?.(null)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedProjectId === null
              ? 'border-blue-500/50 bg-blue-500/10'
              : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-100">All Projects</div>
              <div className="text-xs text-slate-400 mt-1">View all traces across all projects</div>
            </div>
            {selectedProjectId === null && (
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            )}
          </div>
        </div>

        {/* Individual Projects */}
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-slate-400 mb-2">No projects yet. Create one to get started!</div>
            {!import.meta.env.VITE_SUPABASE_URL && (
              <div className="text-xs text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
                <p className="font-semibold mb-1">⚠️ Authentication Required</p>
                <p className="text-yellow-300/80">
                  Project creation requires authentication. Either configure Supabase or update your backend 
                  <code className="bg-slate-800 px-1 rounded mx-1">ProjectController</code> to make 
                  <code className="bg-slate-800 px-1 rounded mx-1">Authentication</code> parameter optional.
                </p>
              </div>
            )}
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedProjectId === project.id
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-100">{project.name}</h3>
                    {selectedProjectId === project.id && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-400 mb-3">{project.description}</p>
                  )}
                  <div className="text-xs text-slate-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium ml-4"
                >
                  Delete
                </button>
              </div>

              {/* API Key Section */}
              <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                      API Key
                    </div>
                    <div className="text-sm font-mono text-slate-300 truncate">
                      {project.apiKey}
                    </div>
                  </div>
                  <button
                    onClick={() => copyApiKey(project.apiKey)}
                    className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    {copiedApiKey === project.apiKey ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Select Project Button */}
              {selectedProjectId !== project.id && (
                <button
                  onClick={() => onSelectProject?.(project.id)}
                  className="mt-3 w-full btn-secondary text-sm"
                >
                  Select Project
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}