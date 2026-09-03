import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// --- Better Auth Core Tables ---

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  activeOrganizationId: text('active_organization_id'),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  issuer: text('issuer'),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// --- Better Auth Organization Tables ---

export const organization = sqliteTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata'),
  // First-class organization type for FinVantage routing logic
  type: text('type', { enum: ['BANK', 'COLLEGE', 'FINVANTAGE'] }).notNull(),
});

export const member = sqliteTable('member', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organization.id),
  userId: text('user_id').notNull().references(() => user.id),
  role: text('role').notNull(), // e.g., 'admin', 'member'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const invitation = sqliteTable('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organization.id),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').notNull(), // e.g., 'pending', 'accepted'
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  inviterId: text('inviter_id').notNull().references(() => user.id),
});

// --- FinVantage Specific Tables ---

// Separated Candidate access. A user may have a candidate profile and/or org memberships.
export const candidateProfiles = sqliteTable('candidate_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => user.id),
  resumeUrl: text('resume_url'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// --- Phase 3A Business Domain Tables ---
import { unique } from 'drizzle-orm/sqlite-core';

export const jobStatusEnum = ['OPEN', 'CLOSED', 'DRAFT'] as const;
export const applicationStatusEnum = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'ACCEPTED'] as const;
export const assessmentStatusEnum = ['ACTIVE', 'ARCHIVED'] as const;
export const assessmentResultStatusEnum = ['PENDING', 'COMPLETED'] as const;

export const candidateSources = sqliteTable('candidate_sources', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => user.id),
  organizationId: text('organization_id').notNull().references(() => organization.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  unq: unique().on(t.candidateId, t.organizationId)
}));

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organization.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status', { enum: jobStatusEnum }).notNull().default('DRAFT'),
  location: text('location'),
  createdBy: text('created_by').notNull().references(() => user.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => user.id),
  jobId: text('job_id').notNull().references(() => jobs.id),
  status: text('status', { enum: applicationStatusEnum }).notNull().default('APPLIED'),
  submittedByOrganizationId: text('submitted_by_organization_id').references(() => organization.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  unq: unique().on(t.candidateId, t.jobId) 
}));

export const assessments = sqliteTable('assessments', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organization.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: assessmentStatusEnum }).notNull().default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const jobAssessments = sqliteTable('job_assessments', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => jobs.id),
  assessmentId: text('assessment_id').notNull().references(() => assessments.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  unq: unique().on(t.jobId, t.assessmentId)
}));

export const assessmentQuestions = sqliteTable('assessment_questions', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').notNull().references(() => assessments.id),
  question: text('question').notNull(),
  type: text('type').notNull().default('MCQ'),
  options: text('options', { mode: 'json' }).$type<string[]>(),
  correctAnswer: text('correct_answer'),
  points: integer('points').notNull().default(1),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const assessmentResults = sqliteTable('assessment_results', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').notNull().references(() => assessments.id),
  candidateId: text('candidate_id').notNull().references(() => user.id),
  applicationId: text('application_id').references(() => applications.id),
  score: integer('score'), 
  answers: text('answers', { mode: 'json' }).$type<Record<string, string>>(),
  status: text('status', { enum: assessmentResultStatusEnum }).notNull().default('PENDING'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
