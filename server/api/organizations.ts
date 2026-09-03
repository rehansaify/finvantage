import { Hono } from 'hono';
import { z } from 'zod';
import { getDb } from '../db';
import { createAuth } from '../auth';
import { organization, member } from '../db/schema';
import { eq } from 'drizzle-orm';

const orgApp = new Hono<{ Bindings: Env }>();

const createOrgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  type: z.enum(['BANK', 'COLLEGE', 'FINVANTAGE'])
});

orgApp.post('/', async (c) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const data = createOrgSchema.parse(body);

    const db = getDb(c.env);
    
    // Check if slug exists
    const existing = await db.select().from(organization).where(eq(organization.slug, data.slug)).get();
    if (existing) {
      return c.json({ error: 'Organization with this slug already exists' }, 400);
    }

    // Use Drizzle directly to ensure first-class type field is saved correctly
    const orgId = crypto.randomUUID().replace(/-/g, '');
    const now = new Date();
    
    const [org] = await db.insert(organization).values({
      id: orgId,
      name: data.name,
      slug: data.slug,
      type: data.type,
      createdAt: now
    } as any).returning();

    await db.insert(member).values({
      id: crypto.randomUUID().replace(/-/g, ''),
      organizationId: orgId,
      userId: session.user.id,
      role: 'admin',
      createdAt: now
    } as any);

    return c.json({ success: true, organization: org });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: err.errors }, 400);
    }
    return c.json({ error: err.message }, 500);
  }
});

orgApp.get('/:id', async (c) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const orgId = c.req.param('id');
  const db = getDb(c.env);

  const { and } = await import('drizzle-orm');
  const callerMembership = await db.select().from(member)
    .where(and(eq(member.userId, session.user.id), eq(member.organizationId, orgId)))
    .get();

  if (!callerMembership) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Return the full organization row including the custom 'type' column
  const org = await db.select().from(organization).where(eq(organization.id, orgId)).get();
  
  if (!org) {
    return c.json({ error: 'Not found' }, 404);
  }
  
  return c.json({ organization: org });
});

orgApp.get('/:id/members', async (c) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const orgId = c.req.param('id');
  const db = getDb(c.env);

  // Security: Verify the caller is actually a member of this specific organization
  const { and } = await import('drizzle-orm');
  const callerMembership = await db.select().from(member)
    .where(and(eq(member.userId, session.user.id), eq(member.organizationId, orgId)))
    .get();

  if (!callerMembership) {
    return c.json({ error: 'Forbidden. You are not a member of this organization.' }, 403);
  }

  // Fetch all members of this organization along with their user details securely
  const { user } = await import('../db/schema');
  
  const members = await db
    .select({
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(eq(member.organizationId, orgId));

  return c.json({ members });
});

export default orgApp;
