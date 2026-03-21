import React, { useState, useEffect } from 'react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface Table {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: Field[];
}

interface Field {
  id: string;
  name: string;
  slug: string;
  type: string;
  isPrimary: boolean;
  isRequired: boolean;
}

export function App() {
  const [view, setView] = useState<'workspaces' | 'tables' | 'records' | 'agent'>('workspaces');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null);

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch(API_BASE + '/api/auth/get-session', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          fetchWorkspaces();
        }
      }
    } catch {
      // Not logged in
    }
  }

  async function fetchWorkspaces() {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/api/workspaces', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces);
      }
    } catch {
      setError('Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegistering ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';

    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(isRegistering ? { email, password, name } : { email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        fetchWorkspaces();
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTables(workspaceId: string) {
    setLoading(true);
    try {
      const ws = workspaces.find(w => w.id === workspaceId);
      const res = await fetch(API_BASE + '/api/tables', {
        credentials: 'include',
        headers: { 'x-workspace-slug': ws?.slug || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables);
        setCurrentWorkspace(ws || null);
        setView('tables');
      }
    } catch {
      setError('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  }

  async function createWorkspace() {
    const name = prompt('Workspace name:');
    const slug = prompt('Workspace slug (URL-friendly):');
    if (!name || !slug) return;

    try {
      const res = await fetch(API_BASE + '/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, slug }),
      });

      if (res.ok) {
        fetchWorkspaces();
      } else {
        setError('Failed to create workspace');
      }
    } catch {
      setError('Network error');
    }
  }

  async function createTable() {
    if (!currentWorkspace) return;

    const name = prompt('Table name:');
    const slug = prompt('Table slug:');
    if (!name || !slug) return;

    const fieldName = prompt('First field name (e.g., id, name, email):');
    const fieldType = prompt('Field type (text, number, boolean, date):') || 'text';
    if (!fieldName) return;

    try {
      const res = await fetch(API_BASE + '/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-slug': currentWorkspace.slug,
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          slug,
          fields: [
            { name: fieldName, slug: fieldName.toLowerCase(), type: fieldType, isPrimary: true },
          ],
        }),
      });

      if (res.ok) {
        fetchTables(currentWorkspace.id);
      }
    } catch {
      setError('Failed to create table');
    }
  }

  async function handleLogout() {
    try {
      await fetch(API_BASE + '/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setTables([]);
    setView('workspaces');
  }

  // Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">NanoDB</h1>
          <h2 className="text-lg font-semibold mb-4">{isRegistering ? 'Create Account' : 'Sign In'}</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setName(''); }}
            className="w-full mt-4 text-sm text-blue-600 hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">NanoDB</h1>
            {currentWorkspace && (
              <span className="text-gray-500">/ {currentWorkspace.name}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => { setView('workspaces'); setCurrentWorkspace(null); }}
              className={'py-4 px-2 border-b-2 text-sm font-medium ' + (
                view === 'workspaces'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Workspaces
            </button>
            {currentWorkspace && (
              <>
                <button
                  onClick={() => setView('tables')}
                  className={'py-4 px-2 border-b-2 text-sm font-medium ' + (
                    view === 'tables'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  Tables
                </button>
                <button
                  onClick={() => setView('agent')}
                  className={'py-4 px-2 border-b-2 text-sm font-medium ' + (
                    view === 'agent'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  AI Agent
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {/* Workspaces view */}
        {view === 'workspaces' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Your Workspaces</h2>
              <button
                onClick={createWorkspace}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                New Workspace
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : workspaces.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No workspaces yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md"
                    onClick={() => fetchTables(ws.id)}
                  >
                    <h3 className="font-semibold text-gray-900">{ws.name}</h3>
                    <p className="text-sm text-gray-500">{ws.slug}</p>
                    <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {ws.plan}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables view */}
        {view === 'tables' && currentWorkspace && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Tables</h2>
                <p className="text-sm text-gray-500">{currentWorkspace.name}</p>
              </div>
              <button
                onClick={createTable}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                New Table
              </button>
            </div>

            {tables.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No tables yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tables.map((table) => (
                      <tr key={table.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 font-medium text-gray-900">{table.name}</td>
                        <td className="px-6 py-4 text-gray-500">{table.slug}</td>
                        <td className="px-6 py-4 text-gray-500">{table.fields?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Agent view */}
        {view === 'agent' && currentWorkspace && (
          <div>
            <h2 className="text-lg font-semibold mb-4">AI Data Analyst</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 mb-4">
                Ask questions about your data in natural language. The AI will generate and execute SQL queries.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-400">
                Agent interface coming soon...
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
