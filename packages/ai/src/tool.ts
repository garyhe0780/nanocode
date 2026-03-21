import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolContext {
  workspaceId: string;
  userId: string;
  tableContext?: {
    tableId: string;
    tableName: string;
  };
}

export interface Tool {
  definition: ToolDefinition;
  execute: (params: unknown, context: ToolContext) => Promise<ToolResult>;
}

// Tool registry
export const tools = new Map<string, Tool>();

export function registerTool(tool: Tool) {
  tools.set(tool.definition.name, tool);
}

export function getTool(name: string): Tool | undefined {
  return tools.get(name);
}

export function listTools(): ToolDefinition[] {
  return Array.from(tools.values()).map((t) => t.definition);
}
