export const queryKeys = {
  session: ['session'] as const,
  workspaces: {
    all: ['workspaces'] as const,
    lists: () => [...queryKeys.workspaces.all, 'list'] as const,
    detail: (workspaceId: string) => [...queryKeys.workspaces.all, 'detail', workspaceId] as const,
  },
  tables: {
    all: (workspaceSlug: string) => ['tables', workspaceSlug] as const,
    lists: (workspaceSlug: string) => [...queryKeys.tables.all(workspaceSlug), 'list'] as const,
  },
  agent: {
    all: (workspaceSlug: string) => ['agent', workspaceSlug] as const,
  },
};
