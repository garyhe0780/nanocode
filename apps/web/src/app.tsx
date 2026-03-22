import React, { useState } from 'react';
import {
  AuthView,
  Header,
  Navigation,
  WorkspacesView,
  TablesView,
  AgentView,
  CreateWorkspaceDialog,
} from '~/components/app';
import { TableEditorSheet } from '~/components/app/sheets/TableEditorSheet';
import { useSession, useSignOut } from '~/hooks/use-session';
import { useWorkspaces } from '~/hooks/use-workspaces';

type View = 'workspaces' | 'tables' | 'agent';

export function App() {
  const [view, setView] = useState<View>('workspaces');
  const [currentWorkspace, setCurrentWorkspace] = useState<{ id: string; name: string; slug: string } | null>(null);

  // Dialog state
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createTableOpen, setCreateTableOpen] = useState(false);

  // Auth
  const { data: session, isPending: sessionPending } = useSession();
  const signOut = useSignOut();

  // Workspaces (for finding workspace by id)
  const { data: workspaces = [] } = useWorkspaces();

  async function handleLogout() {
    await signOut.mutateAsync();
    setCurrentWorkspace(null);
    setView('workspaces');
  }

  function handleSelectWorkspace(workspaceId: string) {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setCurrentWorkspace({ id: ws.id, name: ws.name, slug: ws.slug });
      setView('tables');
    }
  }

  function handleViewChange(v: View) {
    if (v === 'workspaces') {
      setView('workspaces');
      setCurrentWorkspace(null);
    } else if (v === 'tables' && currentWorkspace) {
      setView('tables');
    } else if (v === 'agent' && currentWorkspace) {
      setView('agent');
    }
  }

  // Auth screen
  if (sessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  if (!session?.user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} workspaceName={currentWorkspace?.name} onLogout={handleLogout} />
      <Navigation
        currentView={view}
        onViewChange={handleViewChange}
        hasWorkspace={!!currentWorkspace}
      />

      {/* Content */}
      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        {view === 'workspaces' && (
          <WorkspacesView
            onSelect={handleSelectWorkspace}
            onCreateOpen={() => setCreateWorkspaceOpen(true)}
          />
        )}

        {view === 'tables' && currentWorkspace && (
          <TablesView
            workspaceSlug={currentWorkspace.slug}
            workspaceName={currentWorkspace.name}
            onCreateOpen={() => setCreateTableOpen(true)}
          />
        )}

        {view === 'agent' && currentWorkspace && (
          <AgentView apiBase="http://localhost:3000" workspaceSlug={currentWorkspace.slug} />
        )}
      </main>

      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
      />
      {currentWorkspace && (
        <TableEditorSheet
          open={createTableOpen}
          onOpenChange={setCreateTableOpen}
          workspaceSlug={currentWorkspace.slug}
        />
      )}
    </div>
  );
}
