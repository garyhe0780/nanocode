import { z } from 'zod';
import { Tool, ToolContext, ToolResult, registerTool } from '../tool';
import { prisma } from '@nanodb/db';

const DbQueryParams = z.object({
  sql: z.string().describe('SQL query to execute (SELECT only)'),
});

export const dbQueryTool: Tool = {
  definition: {
    name: 'db_query',
    description: 'Execute a read-only SQL query on the database. Use this to answer questions about the data. Returns results as JSON array.',
    parameters: DbQueryParams,
  },
  execute: async (params: unknown, context: ToolContext): Promise<ToolResult> => {
    const { sql } = DbQueryParams.parse(params);

    // Security: only allow SELECT queries
    const normalizedSql = sql.trim().toUpperCase();
    if (!normalizedSql.startsWith('SELECT')) {
      return {
        success: false,
        error: 'Only SELECT queries are allowed. This is a read-only database.',
      };
    }

    // Check for dangerous operations
    if (
      normalizedSql.includes('DROP') ||
      normalizedSql.includes('DELETE') ||
      normalizedSql.includes('TRUNCATE') ||
      normalizedSql.includes('ALTER') ||
      normalizedSql.includes('INSERT') ||
      normalizedSql.includes('UPDATE') ||
      normalizedSql.includes('CREATE')
    ) {
      return {
        success: false,
        error: 'Only SELECT queries are allowed. This is a read-only database.',
      };
    }

    try {
      // Execute the query - prisma.queryRaw returns results
      const results = await prisma.$queryRawUnsafe(sql);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query execution failed',
      };
    }
  },
};

// Register the tool
registerTool(dbQueryTool);
