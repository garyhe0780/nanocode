import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/lib/query-keys';

const API_BASE = 'http://localhost:3000';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface WorkspacesResponse {
  workspaces: Workspace[];
}

async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await fetch(`${API_BASE}/api/workspaces`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch workspaces');
  const data: WorkspacesResponse = await res.json();
  return data.workspaces;
}

async function createWorkspace(name: string, slug: string): Promise<Workspace> {
  const res = await fetch(`${API_BASE}/api/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) throw new Error('Failed to create workspace');
  return res.json();
}

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.lists(),
    queryFn: fetchWorkspaces,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) => createWorkspace(name, slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.lists() });
    },
  });
}
