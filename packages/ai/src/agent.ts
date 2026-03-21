import { z } from 'zod';
import { getTool, ToolContext, ToolResult } from './tool';

// Agent message types
export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: string[]; // tool names to enable
  memoryEnabled: boolean;
}

export interface AgentRequest {
  query: string;
  context?: {
    tableId?: string;
    tableName?: string;
    recordId?: string;
  };
  sessionHistory?: AgentMessage[];
}

export interface AgentResponse {
  message: string;
  data?: unknown;
  sql?: string;
  toolCalls?: { tool: string; params: unknown; result: ToolResult }[];
}

// Re-expose tool types
export type { ToolContext, ToolResult };
