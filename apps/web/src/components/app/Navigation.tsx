import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

type View = 'workspaces' | 'tables' | 'agent';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  hasWorkspace: boolean;
}

export function Navigation({ currentView, onViewChange, hasWorkspace }: NavigationProps) {
  return (
    <div className="border-b border-border/50">
      <div className="w-full max-w-5xl mx-auto px-6">
        <Tabs value={currentView} onValueChange={(v) => onViewChange(v as View)}>
          <TabsList variant="line">
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            {hasWorkspace && (
              <TabsTrigger value="tables">Tables</TabsTrigger>
            )}
            {hasWorkspace && (
              <TabsTrigger value="agent">AI Agent</TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
