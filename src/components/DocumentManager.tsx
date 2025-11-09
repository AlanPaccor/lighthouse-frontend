// src/components/DocumentManager.tsx
import { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const response = await fetch('http://localhost:8080/api/documents');
    const data = await response.json();
    setDocuments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:8080/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category }),
    });
    setTitle('');
    setContent('');
    setShowForm(false);
    loadDocuments();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this document?')) {
      await fetch(`http://localhost:8080/api/documents/${id}`, { method: 'DELETE' });
      loadDocuments();
    }
  };

  return (
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="h-px w-16 bg-foreground"></div>
          <h2 className="text-3xl font-light text-foreground tracking-tight">Knowledge Base</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
        >
          {showForm ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-foreground/20 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Title</label>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Content</label>
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all duration-300 font-light min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-foreground/20 text-foreground focus:outline-none focus:border-foreground transition-all duration-300 font-light"
            >
              <option value="general">General</option>
              <option value="about">About</option>
              <option value="pricing">Pricing</option>
              <option value="features">Features</option>
              <option value="docs">Documentation</option>
            </select>
          </div>
          <button
            type="submit"
            className="group relative w-full px-8 py-4 bg-foreground text-background font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90"
          >
            <span className="relative z-10">Save Document</span>
            <div className="absolute inset-0 border border-foreground translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      )}

      <div className="space-y-px bg-foreground/10">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6 bg-background space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-foreground text-sm">{doc.title}</div>
                <div className="text-xs text-foreground/60 mt-1 line-clamp-2 font-light">{doc.content}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-foreground/10 text-foreground px-2 py-1 uppercase tracking-wider font-medium">{doc.category}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-foreground/60 hover:text-foreground text-xs font-medium uppercase tracking-wider ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-foreground/50 font-light">
        {documents.length} documents in knowledge base
      </div>
    </div>
  );
}
