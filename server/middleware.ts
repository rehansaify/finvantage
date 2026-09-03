import { Context, Next } from 'hono';
import { createAuth } from './auth';
import { getDb } from './db';
import { member, organization, candidateProfiles } from './db/schema';
import { eq, and } from 'drizzle-orm';

export const requireAuth = async (c: Context, next: Next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('session', session);
  await next();
};

export const requireOrg = (allowedTypes?: ('BANK' | 'COLLEGE' | 'FINVANTAGE')[], allowedRoles?: ('admin' | 'member')[]) => {
  return async (c: Context, next: Next) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const activeOrgId = session.session.activeOrganizationId;
    if (!activeOrgId) {
      return c.json({ error: 'No active organization selected' }, 403);
    }

    const db = getDb(c.env);
    
    // Verify membership independently from client trust
    const membership = await db
      .select({
        role: member.role,
        orgType: organization.type,
      })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, activeOrgId)
        )
      )
      .get();

    if (!membership) {
      return c.json({ error: 'Not a member of the active organization' }, 403);
    }

    if (allowedTypes && !allowedTypes.includes(membership.orgType as any)) {
      return c.json({ error: 'Organization type not authorized for this action' }, 403);
    }

    if (allowedRoles && !allowedRoles.includes(membership.role as any)) {
      return c.json({ error: 'Insufficient role permissions' }, 403);
    }

    c.set('session', session);
    c.set('orgContext', { id: activeOrgId, role: membership.role, type: membership.orgType });
    await next();
  };
};

export const requireCandidate = async (c: Context) => {
  const session = c.get('session');
  if (!session || !session.user?.id) return c.json({ error: 'Unauthorized' }, 401);

  const db = getDb(c.env);
  const profile = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, session.user.id)).get();

  if (!profile) {
    return c.json({ error: 'Candidate profile required' }, 403);
  }
  return null;
};
