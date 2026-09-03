
// ==========================================
// 8. PHASE 3C ENDPOINTS
// ==========================================

// Candidate Profile (GET/PUT)
businessApp.get('/candidates/profile', async (c) => {
  const candidateError = await requireCandidate(c);
  if (candidateError) return candidateError;
  const session = c.get('session');
  const db = getDb(c.env);
  const profile = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, session.user.id)).get();
  return c.json({ profile });
});

businessApp.put('/candidates/profile', async (c) => {
  const candidateError = await requireCandidate(c);
  if (candidateError) return candidateError;
  const session = c.get('session');
  const body = await c.req.json();
  const db = getDb(c.env);
  
  const [profile] = await db.update(candidateProfiles).set({
    resumeUrl: body.resumeUrl ?? null,
    phone: body.phone ?? null,
    updatedAt: new Date()
  }).where(eq(candidateProfiles.userId, session.user.id)).returning();
  
  return c.json({ profile });
});

// College Lookup
businessApp.get('/college/lookup-candidate', requireOrg(['COLLEGE']), async (c) => {
  const email = c.req.query('email');
  if (!email) return c.json({ error: 'Email query parameter is required' }, 400);

  const db = getDb(c.env);
  
  // Must be a valid candidate (has a profile)
  const candidate = await db.select({
    id: user.id,
    name: user.name,
    email: user.email
  })
  .from(user)
  .innerJoin(candidateProfiles, eq(candidateProfiles.userId, user.id))
  .where(eq(user.email, email)).get();

  if (!candidate) {
    return c.json({ error: 'Candidate not found or does not have a candidate profile' }, 404);
  }

  return c.json({ candidate });
});

// College Sourced Candidates List
businessApp.get('/college/candidates', requireOrg(['COLLEGE']), async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId!;
  const db = getDb(c.env);

  const candidates = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: candidateProfiles.phone,
    resumeUrl: candidateProfiles.resumeUrl,
    sourcedAt: candidateSources.createdAt
  })
  .from(candidateSources)
  .innerJoin(user, eq(user.id, candidateSources.candidateId))
  .innerJoin(candidateProfiles, eq(candidateProfiles.userId, user.id))
  .where(eq(candidateSources.organizationId, activeOrgId));

  return c.json({ candidates });
});

// Bank Job Status Management
businessApp.put('/jobs/:jobId', requireOrg(['BANK']), async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId!;
  const jobId = c.req.param('jobId');
  const body = await c.req.json();
  const db = getDb(c.env);

  if (!['DRAFT', 'OPEN', 'CLOSED'].includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  // Verify ownership
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) return c.json({ error: 'Job not found' }, 404);
  if (job.organizationId !== activeOrgId) return c.json({ error: 'Not authorized for this job' }, 403);

  const [updated] = await db.update(jobs)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();

  return c.json({ job: updated });
});

// Bank Application Status Management
businessApp.put('/applications/:applicationId/status', requireOrg(['BANK']), async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId!;
  const appId = c.req.param('applicationId');
  const body = await c.req.json();
  const db = getDb(c.env);

  const allowedStatuses = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'ACCEPTED'];
  if (!allowedStatuses.includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  // Verify the job belongs to the bank
  const app = await db.select({
    application: applications,
    job: jobs
  })
  .from(applications)
  .innerJoin(jobs, eq(jobs.id, applications.jobId))
  .where(eq(applications.id, appId)).get();

  if (!app) return c.json({ error: 'Application not found' }, 404);
  if (app.job.organizationId !== activeOrgId) return c.json({ error: 'Not authorized to modify this application' }, 403);

  const [updated] = await db.update(applications)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(applications.id, appId))
    .returning();

  return c.json({ application: updated });
});
