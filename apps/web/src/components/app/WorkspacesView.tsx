import React from 'react';
import { Button } from '~/components/ui/button';
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from '~/components/ui/empty';
import { Spinner } from '~/components/ui/spinner';
import { useWorkspaces } from '~/hooks/use-workspaces';

interface WorkspacesViewProps {
  onSelect: (id: string) => void;
  onCreateOpen: () => void;
}

export function WorkspacesView({ onSelect, onCreateOpen }: WorkspacesViewProps) {
  const { data: workspaces = [], isPending: loading } = useWorkspaces();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-base font-semibold">Your Workspaces</h2>
        <Button size="sm" onClick={onCreateOpen}>
          + New
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : workspaces.length === 0 ? (
        <Empty>
          <EmptyTitle>No workspaces</EmptyTitle>
          <EmptyDescription>Create your first workspace to get started.</EmptyDescription>
          <EmptyContent>
            <Button size="sm" onClick={onCreateOpen}>
              + New Workspace
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="border-y border-border/50">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelect(ws.id)}
            >
              <div>
                <p className="text-sm">{ws.name}</p>
                <p className="text-xs text-muted-foreground/60">{ws.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground/60">{ws.plan}</span>
                <svg
                  className="w-4 h-4 text-muted-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
