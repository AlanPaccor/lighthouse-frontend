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
      <div className="bg-background border border-foreground/10 p-8">
        <div className="text-center text-foreground/60 font-light">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="h-px w-16 bg-foreground"></div>
          <h2 className="text-3xl font-light text-foreground tracking-tight">Projects</h2>
          <p className="text-sm text-foreground/60 font-light">
            Manage your projects and API keys for SDK integration
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateProject} className="border border-foreground/20 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">
              Project Name *
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              placeholder="My AI Project"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">
              Description (optional)
            </label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              placeholder="Project description..."
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newProjectName.trim()}
            className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">{creating ? 'Creating...' : 'Create Project'}</span>
            {!creating && (
              <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
            )}
          </button>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-px bg-foreground/10">
        {/* All Projects Option */}
        <div
          onClick={() => onSelectProject?.(null)}
          className={`p-6 bg-background cursor-pointer transition-colors ${
            selectedProjectId === null
              ? 'bg-foreground/5 border-l-4 border-foreground'
              : 'hover:bg-muted/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">All Projects</div>
              <div className="text-xs text-foreground/50 mt-1 font-light">View all traces across all projects</div>
            </div>
            {selectedProjectId === null && (
              <div className="w-2 h-2 bg-foreground"></div>
            )}
          </div>
        </div>

        {/* Individual Projects */}
        {projects.length === 0 ? (
          <div className="p-8 text-center bg-background">
            <div className="text-sm text-foreground/60 mb-2 font-light">No projects yet. Create one to get started!</div>
            {!import.meta.env.VITE_SUPABASE_URL && (
              <div className="border border-foreground/20 p-4 mt-4 space-y-2">
                <p className="text-xs font-medium text-foreground uppercase tracking-wider">Authentication Required</p>
                <p className="text-xs text-foreground/60 font-light">
                  Project creation requires authentication. Either configure Supabase or update your backend 
                  <code className="bg-foreground/10 px-1 font-mono text-xs">ProjectController</code> to make 
                  <code className="bg-foreground/10 px-1 font-mono text-xs">Authentication</code> parameter optional.
                </p>
              </div>
            )}
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`p-6 bg-background transition-colors ${
                selectedProjectId === project.id
                  ? 'bg-foreground/5 border-l-4 border-foreground'
                  : 'hover:bg-muted/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    {selectedProjectId === project.id && (
                      <span className="text-xs bg-foreground/10 text-foreground px-2 py-1 uppercase tracking-wider font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-foreground/60 mb-3 font-light">{project.description}</p>
                  )}
                  <div className="text-xs text-foreground/50 font-light">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-foreground/60 hover:text-foreground text-xs font-medium uppercase tracking-wider ml-4"
                >
                  Delete
                </button>
              </div>

              {/* API Key Section */}
              <div className="mt-4 p-4 bg-foreground/5 border border-foreground/10 space-y-2">
                <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">
                  API Key
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-mono text-foreground truncate">
                    {project.apiKey}
                  </div>
                  <button
                    onClick={() => copyApiKey(project.apiKey)}
                    className="px-3 py-1.5 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5 flex-shrink-0"
                  >
                    {copiedApiKey === project.apiKey ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Select Project Button */}
              {selectedProjectId !== project.id && (
                <button
                  onClick={() => onSelectProject?.(project.id)}
                  className="mt-4 w-full px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
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
