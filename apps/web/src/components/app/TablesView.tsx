import React from 'react';
import { Button } from '~/components/ui/button';
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from '~/components/ui/empty';
import { Spinner } from '~/components/ui/spinner';
import { useTables } from '~/hooks/use-tables';

interface TablesViewProps {
  workspaceSlug: string;
  workspaceName: string;
  onCreateOpen: () => void;
}

export function TablesView({ workspaceSlug, workspaceName, onCreateOpen }: TablesViewProps) {
  const { data: tables = [], isPending: loading } = useTables(workspaceSlug);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-base font-semibold">Tables</h2>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{workspaceName}</p>
        </div>
        <Button size="sm" onClick={onCreateOpen}>
          + New
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : tables.length === 0 ? (
        <Empty>
          <EmptyTitle>No tables</EmptyTitle>
          <EmptyDescription>Create your first table to start storing data.</EmptyDescription>
          <EmptyContent>
            <Button size="sm" onClick={onCreateOpen}>
              + New Table
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Fields
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr
                  key={table.id}
                  className="border-b border-border/50 last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm">{table.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground/60">{table.slug}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground/60">
                    {table.fields?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
