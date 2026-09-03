import { Hono } from 'hono';
import { z } from 'zod';
import { createAuth } from '../auth';
import { getDb } from '../db';
import { jobs, applications, candidateSources, organization, user, candidateProfiles, assessments, jobAssessments, assessmentResults, assessmentQuestions } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { requireOrg, requireAuth, requireCandidate } from '../middleware';

export const businessApp = new Hono<{ Bindings: Env }>();

businessApp.use('/jobs', requireAuth);
businessApp.use('/jobs/*', requireAuth);
businessApp.use('/applications', requireAuth);
businessApp.use('/applications/*', requireAuth);
businessApp.use('/candidates/*', requireAuth);
businessApp.use('/assessments', requireAuth);
businessApp.use('/assessments/*', requireAuth);
businessApp.use('/candidate/assessments', requireAuth);

// ==========================================
// 1. CANDIDATE PROFILE ONBOARDING (/api/candidates/profile)
// ==========================================
businessApp.post('/candidates/profile', async (c) => {
  const session = c.get('session');
  const db = getDb(c.env);
  
  // Idempotent: check if exists first
  const existing = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, session.user.id)).get();
  if (existing) {
    return c.json({ profile: existing });
  }

  try {
    const [profile] = await db.insert(candidateProfiles).values({
      id: `cand-${Date.now()}`,
      userId: session.user.id,
      resumeUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return c.json({ profile });
  } catch (err: any) {
    // Fallback if unique constraint hits due to race condition
    const msg = err.message + (err.cause?.message || '');
    if (msg.includes('UNIQUE constraint failed') || msg.includes('D1_ERROR')) {
      const raceExisting = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, session.user.id)).get();
      if (raceExisting) return c.json({ profile: raceExisting });
    }
    return c.json({ error: err.message }, 500);
  }
});


// ==========================================
// 2. CANDIDATE SOURCES (/api/candidates/sources)
// ==========================================
businessApp.post('/candidates/sources', requireOrg(['COLLEGE']), async (c) => {
  const session = c.get('session');
  const orgId = session.session.activeOrganizationId!;
  
  const body = await c.req.json();
  if (!body.candidateId) return c.json({ error: 'candidateId is required' }, 400);

  const db = getDb(c.env);

  // In a real app we'd verify the candidate actually exists, but Drizzle foreign keys handle it mostly.
  try {
    const [source] = await db.insert(candidateSources).values({
      id: `src-${Date.now()}`,
      candidateId: body.candidateId,
      organizationId: orgId,
      createdAt: new Date()
    }).returning();
    
    return c.json({ source });
  } catch (err: any) {
    const msg = err.message + (err.cause?.message || '');
    if (msg.includes('UNIQUE constraint failed') || msg.includes('D1_ERROR')) {
      return c.json({ error: 'Candidate already sourced by this college' }, 409);
    }
    return c.json({ error: err.message }, 500);
  }
});


// ==========================================
// 3. JOBS (/api/jobs)
// ==========================================
businessApp.post('/jobs', requireOrg(['BANK']), async (c) => {
  const session = c.get('session');
  const orgId = session.session.activeOrganizationId!;
  
  const body = await c.req.json();
  const db = getDb(c.env);

  // Strict injection: organizationId is always the session's active org.
  const [job] = await db.insert(jobs).values({
    id: `job-${Date.now()}`,
    organizationId: orgId,
    title: body.title,
    description: body.description,
    status: body.status || 'OPEN',
    location: body.location || null,
    createdBy: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return c.json({ job });
});

businessApp.get('/jobs', async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId;
  const db = getDb(c.env);

  if (activeOrgId) {
    // If authenticated under an organization, they must be a BANK to see their own jobs
    const callerOrg = await db.select().from(organization).where(eq(organization.id, activeOrgId)).get();
    if (callerOrg?.type !== 'BANK') {
      return c.json({ error: 'Only banks can view their owned jobs in this context' }, 403);
    }
    const orgJobs = await db.select().from(jobs).where(eq(jobs.organizationId, activeOrgId));
    return c.json({ jobs: orgJobs });
  } else {
    // Candidate Context: Explicitly require Candidate capability
    const candidateError = await requireCandidate(c);
    if (candidateError) return candidateError;

    // Candidate Context: Can see all OPEN jobs across the platform
    const openJobs = await db.select().from(jobs).where(eq(jobs.status, 'OPEN'));
    return c.json({ jobs: openJobs });
  }
});


// ==========================================
// 4. APPLICATIONS (/api/applications)
// ==========================================
businessApp.post('/applications', async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId;
  const body = await c.req.json();
  if (!body.jobId) return c.json({ error: 'jobId is required' }, 400);

  const db = getDb(c.env);

  let candidateId = session.user.id;
  let submittedByOrgId = null;

  if (activeOrgId) {
    // Caller is acting as an Organization (COLLEGE)
    const callerOrg = await db.select().from(organization).where(eq(organization.id, activeOrgId)).get();
    if (callerOrg?.type !== 'COLLEGE') {
      return c.json({ error: 'Only Colleges can submit applications on behalf of candidates' }, 403);
    }

    if (!body.candidateId) {
      return c.json({ error: 'candidateId is required when submitting as a college' }, 400);
    }
    
    // VERIFY: The college must have a relationship with this candidate
    const link = await db.select().from(candidateSources)
      .where(and(eq(candidateSources.candidateId, body.candidateId), eq(candidateSources.organizationId, activeOrgId)))
      .get();
      
    if (!link) {
      return c.json({ error: 'Forbidden. Candidate is not sourced by this college.' }, 403);
    }
    
    candidateId = body.candidateId;
    submittedByOrgId = activeOrgId;
  } else {
    // Candidate Context: Explicitly require Candidate capability
    const candidateError = await requireCandidate(c);
    if (candidateError) return candidateError;

    if (body.candidateId && body.candidateId !== session.user.id) {
      // Reject spoofing attempts
      return c.json({ error: 'Candidates can only apply for themselves' }, 403);
    }
  }

  try {
    const [app] = await db.insert(applications).values({
      id: `app-${Date.now()}`,
      candidateId,
      jobId: body.jobId,
      submittedByOrganizationId: submittedByOrgId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return c.json({ application: app });
  } catch (err: any) {
    const msg = err.message + (err.cause?.message || '');
    if (msg.includes('UNIQUE constraint failed') || msg.includes('D1_ERROR')) {
      return c.json({ error: 'Duplicate application' }, 409);
    }
    return c.json({ error: err.message }, 500);
  }
});

businessApp.get('/applications', async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId;
  const db = getDb(c.env);

  if (activeOrgId) {
    const callerOrg = await db.select().from(organization).where(eq(organization.id, activeOrgId)).get();
    
    if (callerOrg?.type === 'BANK') {
      const bankJobs = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.organizationId, activeOrgId));
      const jobIds = bankJobs.map(j => j.id);
      
      if (jobIds.length === 0) return c.json({ applications: [] });
      
      const apps = await db.select({
        application: applications,
        candidateName: user.name,
        candidateEmail: user.email,
        candidatePhone: candidateProfiles.phone,
        candidateResumeUrl: candidateProfiles.resumeUrl
      })
      .from(applications)
      .innerJoin(user, eq(user.id, applications.candidateId))
      .leftJoin(candidateProfiles, eq(candidateProfiles.userId, user.id))
      .where(inArray(applications.jobId, jobIds));
      
      return c.json({ applications: apps });
    } 
    else if (callerOrg?.type === 'COLLEGE') {
      const apps = await db.select().from(applications).where(eq(applications.submittedByOrganizationId, activeOrgId));
      return c.json({ applications: apps.map(a => ({ application: a })) });
    } else {
      return c.json({ error: 'Unsupported organization type' }, 403);
    }
  } else {
    const candidateError = await requireCandidate(c);
    if (candidateError) return candidateError;

    const apps = await db.select({
      application: applications,
      jobTitle: jobs.title
    }).from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .where(eq(applications.candidateId, session.user.id));
    return c.json({ applications: apps });
  }
});



// ==========================================
// 5. ASSESSMENTS (/api/assessments)
// ==========================================
businessApp.post('/assessments', requireOrg(['BANK', 'FINVANTAGE']), async (c) => {
  const session = c.get('session');
  const orgId = session.session.activeOrganizationId!;
  const body = await c.req.json();
  const db = getDb(c.env);

  const [assessment] = await db.insert(assessments).values({
    id: `ast-${Date.now()}`,
    organizationId: orgId,
    title: body.title,
    description: body.description || null,
    status: body.status || 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return c.json({ assessment });
});

businessApp.get('/assessments', requireOrg(['BANK', 'FINVANTAGE']), async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId!;
  const db = getDb(c.env);

  // Return only assessments the current organization is authorized to see.
  // FINVANTAGE behavior follows existing architecture: it just sees its own templates.
  const orgAssessments = await db.select().from(assessments).where(eq(assessments.organizationId, activeOrgId));
  return c.json({ assessments: orgAssessments });
});

businessApp.post('/jobs/:jobId/assessments', requireOrg(['BANK']), async (c) => {
  const session = c.get('session');
  const orgId = session.session.activeOrganizationId!;
  const jobId = c.req.param('jobId');
  const body = await c.req.json();
  const db = getDb(c.env);

  if (!body.assessmentId) return c.json({ error: 'assessmentId is required' }, 400);

  // Verify caller is authorized for the job's owning BANK
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) return c.json({ error: 'Job not found' }, 404);
  if (job.organizationId !== orgId) return c.json({ error: 'Not authorized for this job' }, 403);

  // Verify assessment is accessible to the caller
  const ast = await db.select().from(assessments).where(eq(assessments.id, body.assessmentId)).get();
  if (!ast) return c.json({ error: 'Assessment not found' }, 404);
  if (ast.organizationId !== orgId) return c.json({ error: 'Not authorized to assign this assessment' }, 403);

  try {
    const [mapping] = await db.insert(jobAssessments).values({
      id: `ja-${Date.now()}`,
      jobId,
      assessmentId: body.assessmentId,
      createdAt: new Date()
    }).returning();
    return c.json({ jobAssessment: mapping });
  } catch (err: any) {
    const msg = err.message + (err.cause?.message || '');
    if (msg.includes('UNIQUE constraint failed') || msg.includes('D1_ERROR')) {
      return c.json({ error: 'Assessment already assigned to this job' }, 409);
    }
    return c.json({ error: err.message }, 500);
  }
});

businessApp.get('/jobs/:jobId/assessments', async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId;
  const jobId = c.req.param('jobId');
  const db = getDb(c.env);

  if (activeOrgId) {
    const callerOrg = await db.select().from(organization).where(eq(organization.id, activeOrgId)).get();
    if (callerOrg?.type !== 'BANK') return c.json({ error: 'Only banks can view job assessments' }, 403);
    
    const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();
    if (!job) return c.json({ error: 'Job not found' }, 404);
    if (job.organizationId !== activeOrgId) return c.json({ error: 'Not authorized for this job' }, 403);
  } else {
    // Candidate Context
    const candidateError = await requireCandidate(c);
    if (candidateError) return candidateError;
    
    // Check if candidate actually applied to this job (only way they should see its assessments directly)
    const app = await db.select().from(applications).where(and(eq(applications.jobId, jobId), eq(applications.candidateId, session.user.id))).get();
    if (!app) return c.json({ error: 'Not authorized to view assessments for jobs you have not applied to' }, 403);
  }

  // Return the assessments
  const assigned = await db.select({
    assessment: assessments
  })
  .from(jobAssessments)
  .innerJoin(assessments, eq(assessments.id, jobAssessments.assessmentId))
  .where(eq(jobAssessments.jobId, jobId));

  return c.json({ assessments: assigned.map(a => a.assessment) });
});

// ==========================================
// 6. CANDIDATE ASSESSMENTS (/api/candidate/assessments)
// ==========================================
businessApp.get('/candidate/assessments', async (c) => {
  const candidateError = await requireCandidate(c);
  if (candidateError) return candidateError;

  const session = c.get('session');
  const db = getDb(c.env);

  const eligibleAssessments = await db.select({
    assessment: assessments,
    jobId: jobs.id,
    applicationId: applications.id
  })
  .from(applications)
  .innerJoin(jobs, eq(jobs.id, applications.jobId))
  .innerJoin(jobAssessments, eq(jobAssessments.jobId, jobs.id))
  .innerJoin(assessments, eq(assessments.id, jobAssessments.assessmentId))
  .where(eq(applications.candidateId, session.user.id));

  const results = await db.select().from(assessmentResults).where(eq(assessmentResults.candidateId, session.user.id));

  return c.json({ assessments: eligibleAssessments, results });
});

businessApp.post('/assessments/:assessmentId/results', async (c) => {
  const candidateError = await requireCandidate(c);
  if (candidateError) return candidateError;

  const session = c.get('session');
  const assessmentId = c.req.param('assessmentId');
  const body = await c.req.json();
  const db = getDb(c.env);

  if (!body.applicationId) return c.json({ error: 'applicationId is required' }, 400);

  const eligible = await db.select()
    .from(applications)
    .innerJoin(jobAssessments, eq(jobAssessments.jobId, applications.jobId))
    .where(and(
      eq(applications.id, body.applicationId),
      eq(applications.candidateId, session.user.id),
      eq(jobAssessments.assessmentId, assessmentId)
    )).get();

  if (!eligible) {
    return c.json({ error: 'Not eligible to submit a result for this assessment' }, 403);
  }

  const [result] = await db.insert(assessmentResults).values({
    id: `res-${Date.now()}`,
    assessmentId,
    candidateId: session.user.id,
    applicationId: body.applicationId,
    score: body.score,
    status: 'COMPLETED',
    completedAt: new Date(),
    createdAt: new Date()
  }).returning();

  return c.json({ result });
});

// ==========================================
// 7. APPLICATION ASSESSMENTS (/api/applications/:applicationId/assessments)
// ==========================================
businessApp.get('/applications/:applicationId/assessments', async (c) => {
  const session = c.get('session');
  const activeOrgId = session.session.activeOrganizationId;
  const appId = c.req.param('applicationId');
  const db = getDb(c.env);

  const app = await db.select({
    application: applications,
    job: jobs
  })
  .from(applications)
  .innerJoin(jobs, eq(jobs.id, applications.jobId))
  .where(eq(applications.id, appId)).get();

  if (!app) return c.json({ error: 'Application not found' }, 404);

  if (activeOrgId) {
    const callerOrg = await db.select().from(organization).where(eq(organization.id, activeOrgId)).get();
    
    if (callerOrg?.type === 'BANK') {
      if (app.job.organizationId !== activeOrgId) return c.json({ error: 'Not authorized for this application' }, 403);
    } 
    else if (callerOrg?.type === 'COLLEGE') {
      if (app.application.submittedByOrganizationId !== activeOrgId) return c.json({ error: 'Not authorized for this application' }, 403);
    } else {
      return c.json({ error: 'Unsupported organization type' }, 403);
    }
  } else {
    // Candidate Context
    const candidateError = await requireCandidate(c);
    if (candidateError) return candidateError;

    if (app.application.candidateId !== session.user.id) return c.json({ error: 'Not authorized for this application' }, 403);
  }

  // Get the assessments assigned to the job
  const jobAsts = await db.select({
    assessment: assessments
  })
  .from(jobAssessments)
  .innerJoin(assessments, eq(assessments.id, jobAssessments.assessmentId))
  .where(eq(jobAssessments.jobId, app.job.id));

  // Get the submitted results for this application
  const results = await db.select()
    .from(assessmentResults)
    .where(eq(assessmentResults.applicationId, app.application.id));

  return c.json({
    assessments: jobAsts.map(ja => ja.assessment),
    results
  });
});


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


// ==========================================
// 8. ASSESSMENT QUESTIONS (/api/assessments/:assessmentId/questions)
// ==========================================
businessApp.post('/assessments/:assessmentId/questions', requireOrg(['BANK', 'FINVANTAGE']), async (c) => {
  const session = c.get('session');
  const orgId = session.session.activeOrganizationId;
  const assessmentId = c.req.param('assessmentId');
  const body = await c.req.json();
  const db = getDb(c.env);

  const ast = await db.select().from(assessments).where(and(eq(assessments.id, assessmentId), eq(assessments.organizationId, orgId))).get();
  if (!ast) return c.json({ error: 'Assessment not found or not owned by your organization' }, 403);

  if (!body.question || typeof body.question !== 'string' || body.question.trim() === '') {
    return c.json({ error: 'Question cannot be empty' }, 400);
  }
  if (body.type && body.type !== 'MCQ') {
    return c.json({ error: 'Only MCQ is supported' }, 400);
  }
  if (!Array.isArray(body.options) || body.options.length < 2) {
    return c.json({ error: 'Must provide at least 2 options' }, 400);
  }
  const uniqueOptions = new Set(body.options);
  if (uniqueOptions.size !== body.options.length) {
    return c.json({ error: 'Options must be unique' }, 400);
  }
  if (!body.options.includes(body.correctAnswer)) {
    return c.json({ error: 'Correct answer must match an option' }, 400);
  }
  if (body.points !== undefined && (typeof body.points !== 'number' || body.points < 1)) {
    return c.json({ error: 'Points must be a positive integer' }, 400);
  }


  const [question] = await db.insert(assessmentQuestions).values({
    id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    assessmentId,
    question: body.question,
    type: body.type || 'MCQ',
    options: body.options || [],
    correctAnswer: body.correctAnswer,
    points: body.points || 1,
    order: body.order || 0,
    createdAt: new Date()
  }).returning();

  return c.json({ question });
});

businessApp.get('/assessments/:assessmentId/questions', async (c) => {
  const session = c.get('session');
  const orgId = session.session.activeOrganizationId;
  const assessmentId = c.req.param('assessmentId');
  const db = getDb(c.env);

  let isAuthorized = false;
  let isCandidate = false;

  if (orgId) {
    const ast = await db.select().from(assessments).where(and(eq(assessments.id, assessmentId), eq(assessments.organizationId, orgId))).get();
    if (ast) isAuthorized = true;
  } else {
    // Candidate Check
    const candidateError = await requireCandidate(c);
    if (!candidateError) {
      // Must be eligible through job application
      const eligible = await db.select()
        .from(applications)
        .innerJoin(jobAssessments, eq(jobAssessments.jobId, applications.jobId))
        .where(and(
          eq(applications.candidateId, session.user.id),
          eq(jobAssessments.assessmentId, assessmentId)
        )).get();
      if (eligible) {
        isAuthorized = true;
        isCandidate = true;
      }
    }
  }

  if (!isAuthorized) {
    return c.json({ error: 'Not authorized to view questions for this assessment' }, 403);
  }

  const questions = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, assessmentId));

  if (isCandidate) {
    // Never expose correct answers to candidates!
    const sanitized = questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });
    return c.json({ questions: sanitized });
  }

  return c.json({ questions });
});

// ==========================================
// 9. ASSESSMENT SUBMISSION (/api/assessments/:assessmentId/submit)
// ==========================================
businessApp.post('/assessments/:assessmentId/submit', async (c) => {
  const candidateError = await requireCandidate(c);
  if (candidateError) return candidateError;

  const session = c.get('session');
  const assessmentId = c.req.param('assessmentId');
  const body = await c.req.json();
  const db = getDb(c.env);

  if (!body.applicationId) return c.json({ error: 'applicationId is required' }, 400);
  if (!body.answers || typeof body.answers !== 'object') return c.json({ error: 'answers object is required' }, 400);

  // 1. Verify eligibility
  const eligible = await db.select()
    .from(applications)
    .innerJoin(jobAssessments, eq(jobAssessments.jobId, applications.jobId))
    .where(and(
      eq(applications.id, body.applicationId),
      eq(applications.candidateId, session.user.id),
      eq(jobAssessments.assessmentId, assessmentId)
    )).get();

  if (!eligible) {
    return c.json({ error: 'Not eligible to submit a result for this assessment' }, 403);
  }

  // 2. Fetch Questions & Calculate Score
  const questions = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, assessmentId));

  if (questions.length === 0) {
    return c.json({ error: 'Assessment has no questions' }, 400);
  }

  const validQuestionIds = new Set(questions.map(q => q.id));
  const submittedQuestionIds = Object.keys(body.answers);
  const hasInvalidIds = submittedQuestionIds.some(id => !validQuestionIds.has(id));
  if (hasInvalidIds) {
    return c.json({ error: 'Submitted answers contain invalid question IDs' }, 400);
  }

  
  let scorePoints = 0;
  let totalPoints = 0;

  for (const q of questions) {
    totalPoints += q.points;
    const submittedAnswer = body.answers[q.id];
    if (submittedAnswer && submittedAnswer === q.correctAnswer) {
      scorePoints += q.points;
    }
  }

  const percentage = totalPoints > 0 ? Math.round((scorePoints / totalPoints) * 100) : 0;

  // 3. Insert Result
  const [result] = await db.insert(assessmentResults).values({
    id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    assessmentId,
    candidateId: session.user.id,
    applicationId: body.applicationId,
    score: percentage,
    answers: body.answers, // Store the raw submitted answers
    status: 'COMPLETED',
    completedAt: new Date(),
    createdAt: new Date()
  }).returning();

  return c.json({ result });
});

export default businessApp;
