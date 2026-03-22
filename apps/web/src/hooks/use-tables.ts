import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/lib/query-keys';

const API_BASE = 'http://localhost:3000';

interface Table {
  id: string;
  name: string;
  slug: string;
  fields: { length: number }[];
}

interface TablesResponse {
  tables: Table[];
}

async function fetchTables(workspaceSlug: string): Promise<Table[]> {
  const res = await fetch(`${API_BASE}/api/tables`, {
    credentials: 'include',
    headers: { 'x-workspace-slug': workspaceSlug },
  });
  if (!res.ok) throw new Error('Failed to fetch tables');
  const data: TablesResponse = await res.json();
  return data.tables;
}

async function createTable(
  workspaceSlug: string,
  name: string,
  slug: string,
  fields: { name: string; type: string }[]
): Promise<Table> {
  const res = await fetch(`${API_BASE}/api/tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-slug': workspaceSlug,
    },
    credentials: 'include',
    body: JSON.stringify({ name, slug, fields }),
  });
  if (!res.ok) throw new Error('Failed to create table');
  return res.json();
}

export function useTables(workspaceSlug: string) {
  return useQuery({
    queryKey: queryKeys.tables.lists(workspaceSlug),
    queryFn: () => fetchTables(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceSlug,
      name,
      slug,
      fields,
    }: {
      workspaceSlug: string;
      name: string;
      slug: string;
      fields: { name: string; type: string }[];
    }) => createTable(workspaceSlug, name, slug, fields),
    onSuccess: (_, { workspaceSlug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.lists(workspaceSlug) });
    },
  });
}
