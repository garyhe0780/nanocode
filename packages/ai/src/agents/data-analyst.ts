import { createLLMMessage, LLMConfig } from '../llm';
import { getTool, ToolContext } from '../tool';
import { prisma } from '@nanodb/db';

export interface DataAnalystConfig {
  llm: LLMConfig;
  workspaceId: string;
  userId: string;
}

export interface QueryResult {
  message: string;
  data?: unknown;
  sql?: string;
  error?: string;
}

async function buildSchemaContext(workspaceId: string): Promise<string> {
  const tables = await prisma.table.findMany({
    where: { workspaceId },
    include: { fields: true },
  });

  let context = 'Database Schema:\n';
  context += 'Data is stored in PostgreSQL with the following structure:\n';
  context += '- Each user-defined table (like "users", "products") is stored in the "Record" table\n';
  context += '- The "data" column contains JSON with the actual record fields\n';
  context += '- Records are linked to tables via "tableId"\n\n';

  for (const table of tables) {
    context += `Table: "${table.slug}" ID: "${table.id}" (display name: ${table.name})\n`;
    context += '  Fields in this table:\n';
    for (const field of table.fields) {
      context += `    - ${field.slug} (${field.type})${field.isPrimary ? ' [PRIMARY KEY]' : ''}${field.isRequired ? ' [REQUIRED]' : ''}\n`;
    }
  }

  context += '\nIMPORTANT: To query data, use the actual table ID from above. Example:\n';
  context += '  SELECT data->>\'name\' as name, data->>\'email\' as email FROM "Record" WHERE "tableId" = \'(use actual table ID)\'\n';

  return context;
}

export async function queryDataAnalyst(
  userQuery: string,
  config: DataAnalystConfig
): Promise<QueryResult> {
  const { llm, workspaceId, userId } = config;

  const schemaContext = await buildSchemaContext(workspaceId);

  const systemPrompt = `You are a Data Analyst agent. Your job is to help users query their database using natural language.

${schemaContext}

Guidelines:
- Data is stored in the "Record" table with JSON in the "data" column
- Query examples:
  SELECT data->>'name' as name, data->>'email' as email FROM "Record" WHERE "tableId" = 'table-uuid'
- Use ->> to extract text from JSON, -> for numeric values
- Always use double quotes for table and column names: "Record", "tableId", "data"
- Only SELECT is allowed (read-only)
- Return the SQL query wrapped in \`\`\`sql ... \`\`\`
- If the user asks something that requires modifying data, explain that you can only read data

User question: ${userQuery}

Generate a SQL query to answer this question. Return ONLY the SQL query.`;

  try {
    const sql = await createLLMMessage(llm, {
      systemPrompt,
      userMessage: userQuery,
      maxTokens: 1024,
    });

    // Extract SQL from markdown if present
    let cleanSql = sql.trim();
    if (cleanSql.includes('```sql')) {
      cleanSql = cleanSql.split('```sql')[1]?.split('```')[0]?.trim() || cleanSql;
    } else if (cleanSql.includes('```')) {
      cleanSql = cleanSql.split('```')[1]?.split('```')[0]?.trim() || cleanSql;
    }

    const toolContext: ToolContext = {
      workspaceId,
      userId,
    };

    const dbQueryTool = getTool('db_query');
    if (!dbQueryTool) {
      return { message: 'Database query tool not available', error: 'Tool not found' };
    }

    const result = await dbQueryTool.execute({ sql: cleanSql }, toolContext);

    if (!result.success) {
      return {
        message: 'Query execution failed',
        error: result.error,
        sql: cleanSql,
      };
    }

    const dataArray = Array.isArray(result.data) ? result.data : [result.data];
    const rowCount = dataArray.length;

    return {
      message: `Found ${rowCount} result${rowCount !== 1 ? 's' : ''}.`,
      data: result.data,
      sql: cleanSql,
    };
  } catch (error) {
    return {
      message: 'Failed to process query',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
