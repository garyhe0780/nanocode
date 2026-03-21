import { auth } from '@nanodb/auth';
import { prisma } from '@nanodb/db';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Workspace middleware
async function getWorkspaceId(req: Request): Promise<string | null> {
  const workspaceSlug = req.headers.get('x-workspace-slug');
  if (workspaceSlug) {
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });
    return workspace?.id ?? null;
  }
  return null;
}

// Protected route wrapper - requires valid session + workspace context
async function protectedRoute(
  req: Request,
  handler: (req: Request, userId: string, workspaceId: string) => Promise<Response>
) {
  const cookieHeader = req.headers.get('cookie');
  const cookie = cookieHeader
    ?.split(';')
    ?.find(c => c.trim().startsWith('better-auth.session_token='));

  // Cookie value format: token.signature (may be URL encoded)
  const sessionToken = cookie
    ?.split('=')[1]
    ?.trim()
    ?.split('.')[0]; // Take only the token part, not the signature

  if (!sessionToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session || session.expiresAt < new Date()) {
    return Response.json({ error: 'Session expired' }, { status: 401 });
  }

  const workspaceId = await getWorkspaceId(req);
  if (!workspaceId) {
    return Response.json({ error: 'Workspace not found' }, { status: 404 });
  }

  return handler(req, session.userId, workspaceId);
}

// Authenticated route wrapper - requires valid session only (no workspace required)
async function authenticatedRoute(
  req: Request,
  handler: (req: Request, userId: string) => Promise<Response>
) {
  const cookieHeader = req.headers.get('cookie');
  const cookie = cookieHeader
    ?.split(';')
    ?.find(c => c.trim().startsWith('better-auth.session_token='));

  const sessionToken = cookie
    ?.split('=')[1]
    ?.trim()
    ?.split('.')[0];

  if (!sessionToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session || session.expiresAt < new Date()) {
    return Response.json({ error: 'Session expired' }, { status: 401 });
  }

  return handler(req, session.userId);
}

// Route definitions
const routes = {
  // Health check
  '/health': {
    GET: () => Response.json({ status: 'ok' }),
  },

  // Route order matters! More specific routes must come before less specific ones

  // Record routes first (must be before /api/tables)
  '/api/tables/:tableId/records': {
    GET: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const tableId = pathParts[pathParts.length - 2];
        const page = parseInt(url.searchParams.get('page') ?? '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') ?? '50');

        const table = await prisma.table.findFirst({
          where: { id: tableId, workspaceId },
        });
        if (!table) {
          return Response.json({ error: 'Table not found' }, { status: 404 });
        }

        const [records, total] = await Promise.all([
          prisma.record.findMany({
            where: { tableId },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.record.count({ where: { tableId } }),
        ]);

        return Response.json({ records, total, page, pageSize });
      });
    },
    POST: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const tableId = pathParts[pathParts.length - 2];
        const body = await req.json();
        const { data } = body as { data: Record<string, unknown> };

        const table = await prisma.table.findFirst({
          where: { id: tableId, workspaceId },
        });
        if (!table) {
          return Response.json({ error: 'Table not found' }, { status: 404 });
        }

        const record = await prisma.record.create({
          data: {
            tableId,
            data: JSON.parse(JSON.stringify(data)),
          },
        });

        return Response.json({ record }, { status: 201 });
      });
    },
  },

  '/api/tables/:tableId/records/:id': {
    PUT: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const tableId = pathParts[pathParts.length - 3];
        const id = pathParts[pathParts.length - 1];
        const body = await req.json();
        const { data } = body as { data: Record<string, unknown> };

        const table = await prisma.table.findFirst({
          where: { id: tableId, workspaceId },
        });
        if (!table) {
          return Response.json({ error: 'Table not found' }, { status: 404 });
        }

        const record = await prisma.record.updateMany({
          where: { id, tableId },
          data: { data: JSON.parse(JSON.stringify(data)) },
        });

        if (record.count === 0) {
          return Response.json({ error: 'Record not found' }, { status: 404 });
        }

        return Response.json({ success: true });
      });
    },
    DELETE: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const tableId = pathParts[pathParts.length - 3];
        const id = pathParts[pathParts.length - 1];

        await prisma.record.deleteMany({
          where: { id, tableId },
        });

        return Response.json({ success: true });
      });
    },
  },

  // Workspace routes (no workspace context needed)
  '/api/workspaces': {
    GET: async (req: Request) => {
      return authenticatedRoute(req, async (_req, userId) => {
        const memberships = await prisma.workspaceMember.findMany({
          where: { userId },
          include: { workspace: true },
        });
        return Response.json({
          workspaces: memberships.map(m => m.workspace),
        });
      });
    },
    POST: async (req: Request) => {
      return authenticatedRoute(req, async (req, userId) => {
        const body = await req.json();
        const { name, slug } = body as { name: string; slug: string };

        const workspace = await prisma.workspace.create({
          data: {
            name,
            slug,
            members: {
              create: {
                userId,
                role: 'owner',
              },
            },
          },
        });

        return Response.json({ workspace }, { status: 201 });
      });
    },
  },

  // Table routes (workspace context required)
  '/api/tables': {
    GET: async (req: Request) => {
      return protectedRoute(req, async (_req, _userId, workspaceId) => {
        const tables = await prisma.table.findMany({
          where: { workspaceId },
          include: { fields: true },
        });
        return Response.json({ tables });
      });
    },
    POST: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const body = await req.json();
        const { name, slug, description, fields } = body as {
          name: string;
          slug: string;
          description?: string;
          fields?: Array<{
            name: string;
            slug: string;
            type: string;
            options?: unknown;
            isPrimary?: boolean;
            isRequired?: boolean;
          }>;
        };

        const table = await prisma.table.create({
          data: {
            workspaceId,
            name,
            slug,
            description,
            fields: fields ? {
              create: fields.map((f, i) => ({
                name: f.name,
                slug: f.slug,
                type: f.type,
                options: f.options ? JSON.parse(JSON.stringify(f.options)) : undefined,
                isPrimary: f.isPrimary ?? i === 0,
                isRequired: f.isRequired ?? false,
              })),
            } : undefined,
          },
          include: { fields: true },
        });

        return Response.json({ table }, { status: 201 });
      });
    },
  },

  '/api/tables/:id': {
    GET: async (req: Request) => {
      return protectedRoute(req, async (_req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() || '';
        const table = await prisma.table.findFirst({
          where: { id, workspaceId },
          include: { fields: true },
        });
        if (!table) {
          return Response.json({ error: 'Table not found' }, { status: 404 });
        }
        return Response.json({ table });
      });
    },
    PUT: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() || '';
        const body = await req.json();
        const { name, slug, description } = body as {
          name?: string;
          slug?: string;
          description?: string;
        };

        const table = await prisma.table.updateMany({
          where: { id, workspaceId },
          data: { name, slug, description },
        });

        if (table.count === 0) {
          return Response.json({ error: 'Table not found' }, { status: 404 });
        }

        return Response.json({ success: true });
      });
    },
    DELETE: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() || '';
        await prisma.table.deleteMany({
          where: { id, workspaceId },
        });
        return Response.json({ success: true });
      });
    },
  },

  // Agent routes
  '/api/agents': {
    GET: async (req: Request) => {
      return protectedRoute(req, async (_req, _userId, workspaceId) => {
        const agents = await prisma.agent.findMany({
          where: { workspaceId },
        });
        return Response.json({ agents });
      });
    },
  },

  '/api/agents/query': {
    POST: async (req: Request) => {
      return protectedRoute(req, async (req, _userId, workspaceId) => {
        const body = await req.json();
        const { query, agentId, context } = body as {
          query: string;
          agentId?: string;
          context?: { tableId?: string; tableName?: string };
        };

        // TODO: Implement agent query with LLM
        return Response.json({
          message: 'Agent query processed',
          query,
          agentId,
          context,
        });
      });
    },
  },
};

// Fallback for unmatched routes
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Check if path matches a route (handles parameterized routes like /api/tables/:id)
  function matchRoute(pathname: string, pattern: string): boolean {
    const pathParts = pathname.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);

    if (pathParts.length < patternParts.length) return false;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) continue; // wildcard matches anything
      if (pathParts[i] !== patternParts[i]) return false;
    }
    return true;
  }

  for (const pattern of Object.keys(routes)) {
    // Exact match or parameterized route match
    if (path === pattern || matchRoute(path, pattern)) {
      const route = routes[pattern as keyof typeof routes];
      const method = req.method as keyof typeof route;
      if (route && typeof route === 'object' && method in route) {
        const handler = (route as Record<string, unknown>)[method] as (req: Request) => Promise<Response>;
        return handler(req);
      }
    }
  }

  // better-auth handler for /api/auth/*
  if (path.startsWith('/api/auth/')) {
    return auth.handler(req);
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}

Bun.serve({
  port: PORT,
  fetch(req) {
    return handleRequest(req);
  },
  websocket: {
    open(ws) {
      console.log('WebSocket connected');
    },
    message(ws, message) {
      ws.send(JSON.stringify({ type: 'ping' }));
    },
    close(ws) {
      console.log('WebSocket closed');
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`API server running on http://localhost:${PORT}`);
