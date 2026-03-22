import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: unknown[] | null;
  error?: string;
}

interface AgentViewProps {
  apiBase: string;
  workspaceSlug: string;
}

export function AgentView({ apiBase, workspaceSlug }: AgentViewProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/agents/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-slug': workspaceSlug,
        },
        credentials: 'include',
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message || 'Query executed successfully.',
            sql: data.sql,
            data: Array.isArray(data.data) ? data.data : null,
            error: data.error,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Error: ' + (data.error || 'Failed to execute query'),
            error: data.error,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network error. Please try again.',
          error: String(err),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-base font-semibold">AI Data Analyst</h2>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Ask questions about your data
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 border border-border/50 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground/60">
                Ask a question to get started
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="space-y-3">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <p className="text-sm max-w-[75%] text-right">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{msg.content}</p>

                  {msg.error && (
                    <p className="text-sm text-destructive">{msg.error}</p>
                  )}

                  {msg.sql && (
                    <div className="rounded-md p-3 bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
                          SQL
                        </span>
                        <button
                          onClick={() => copyToClipboard(msg.sql!)}
                          className="text-xs text-muted-foreground/60 hover:text-foreground flex items-center gap-1.5 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <code className="block text-xs font-mono text-foreground overflow-x-auto whitespace-pre">
                        {msg.sql}
                      </code>
                    </div>
                  )}

                  {msg.data && msg.data.length > 0 && (
                    <div className="rounded-md p-3 bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
                          Results{' '}
                          <span className="text-muted-foreground/40">
                            ({msg.data.length} rows)
                          </span>
                        </span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(msg.data, null, 2))}
                          className="text-xs text-muted-foreground/60 hover:text-foreground flex items-center gap-1.5 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-foreground overflow-x-auto max-h-40 whitespace-pre">
                        {JSON.stringify(msg.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse" />
              <div
                className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:150ms]"
              />
              <div
                className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:300ms]"
              />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !query.trim()}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
