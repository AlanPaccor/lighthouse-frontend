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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📚 Knowledge Base</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
        >
          {showForm ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm min-h-[100px]"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
          >
            <option value="general">General</option>
            <option value="about">About</option>
            <option value="pricing">Pricing</option>
            <option value="features">Features</option>
            <option value="docs">Documentation</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded transition text-sm"
          >
            Save Document
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-gray-900 p-3 rounded border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{doc.title}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.content}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{doc.category}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-400 hover:text-red-300 text-xs ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-400">
        {documents.length} documents in knowledge base
      </div>
    </div>
  );
}