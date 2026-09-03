# FinVantage

FinVantage is a multi-tenant banking talent platform that connects banks, colleges, and candidates through a structured recruitment workflow.

The platform supports candidate sourcing, job management, applications, assessments, recruitment status tracking, and candidate profiles with strict organization-level access controls.

## Live Demo

https://finvantage.rehansaifi.qzz.io/

## Overview

FinVantage is designed around three primary user types:

- Banks / NBFCs
- Colleges
- Candidates

The platform provides a complete recruitment lifecycle:

1. Candidate onboarding
2. Candidate sourcing through colleges
3. Job creation and publishing
4. Candidate applications
5. Assessment assignment and completion
6. Server-side assessment scoring
7. Application review and interview progression
8. Candidate profile and resume management

## Core Features

### Candidate

- Register and authenticate
- Maintain a candidate profile
- Update phone number and resume URL
- Browse open opportunities
- Apply directly to jobs
- View sourced applications
- Complete assigned assessments
- Navigate through MCQ assessments
- View assessment attempt history
- Retake assessments
- Track application status

### College

- Search for candidates using email
- Only discover users who have completed candidate onboarding
- Add candidates to the college's sourced pool
- Submit sourced candidates to bank opportunities
- View candidates sourced by the college
- Maintain strict tenant isolation

### Bank / NBFC

- Create and manage jobs
- Toggle jobs between DRAFT, OPEN, and CLOSED
- Create assessment templates
- Add multiple-choice questions
- Define correct answers and question points
- Review incoming applications
- View candidate name, email, phone, and resume
- Track recruitment workflow
- Move applications through statuses such as APPLIED, REVIEWING, and INTERVIEW
- View assessment attempt results

## Assessment Engine

FinVantage includes a server-driven assessment system rather than relying on client-side scores.

Banks can create MCQ-based assessments with:

- Questions
- Multiple options
- Correct answers
- Question points
- Question ordering

Candidates receive questions without the correct answers.

When an assessment is submitted:

- The server retrieves the assessment questions from D1
- Candidate-provided scores are ignored
- Candidate identity is derived from the authenticated session
- Answers are validated against the assessment
- The server calculates the final percentage
- Each submission creates a separate assessment attempt

This prevents candidates from manipulating their scores through client-side requests.

## Recruitment Workflow

```text
Candidate
    |
    v
Register / Onboard
    |
    v
Candidate Profile
    |
    +----------------------+
    |                      |
    v                      v
Direct Application    College Sourcing
    |                      |
    +----------+-----------+
               |
               v
        Bank Job Application
               |
               v
          Assessment
               |
               v
            Review
               |
               v
          Interview
               |
               v
       Accepted / Rejected
```

## Security and Multi-Tenancy

The backend enforces organization-level boundaries across recruitment operations.

Key protections include:

- Bank-to-bank data isolation
- College-to-college sourcing isolation
- Candidate identity derived from the authenticated session
- Candidate profile updates restricted to the active candidate
- Bank application updates restricted to jobs owned by the active organization
- Candidate access to assessments requires a valid application mapping
- Assessment answer keys are never returned to candidates
- Assessment scores are calculated exclusively on the server
- Invalid assessment question IDs are rejected
- Cross-tenant question modification is blocked
- Unauthorized application status manipulation is blocked

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend

- Cloudflare Workers
- Hono
- Better Auth
- Drizzle ORM

### Database

- Cloudflare D1
- SQLite
- Drizzle migrations

### Infrastructure

- Cloudflare Workers
- Cloudflare D1
- Wrangler

## Project Structure

```text
FinVantage/
├── server/
│   ├── api/
│   ├── db/
│   ├── auth.ts
│   ├── index.ts
│   └── middleware.ts
├── src/
│   ├── components/
│   ├── lib/
│   └── pages/
│       ├── app/
│       └── auth/
├── drizzle/
├── public/
├── package.json
├── drizzle.config.ts
├── tailwind.config.js
├── tsconfig.json
├── worker-configuration.d.ts
└── wrangler.toml
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the development environment:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Run the project's regression tests:

```bash
node test-phase-3a.js
```

## Database

The project uses Drizzle migrations for Cloudflare D1.

Apply migrations locally:

```bash
npx wrangler d1 migrations apply finvantage_d1 --local
```

Apply migrations to the production database:

```bash
npx wrangler d1 migrations apply finvantage_d1 --remote
```

## Deployment

FinVantage is deployed as a Cloudflare Worker with the React frontend served through the Worker Assets binding.

Build the frontend:

```bash
npm run build
```

Deploy:

```bash
npx wrangler deploy
```

The production deployment uses Cloudflare D1 for persistent application data and Cloudflare Worker secrets for authentication configuration.

## Testing

The project includes a master regression suite covering authentication, organization boundaries, sourcing, applications, assessments, and security edge cases.

The latest implementation includes automated checks for:

- Cross-tenant sourcing isolation
- Invalid candidate lookup
- Candidate capability separation
- Bank application workflow isolation
- Application status authorization
- Assessment question ownership
- Assessment question visibility
- Correct-answer sanitization
- Server-side assessment scoring
- Score spoofing protection
- Invalid assessment submissions
- Candidate profile IDOR protection

## Current Status

FinVantage currently provides a working end-to-end recruitment platform with:

- Multi-tenant authentication
- College candidate sourcing
- Bank job management
- Candidate applications
- Candidate profiles
- Assessment creation
- MCQ test-taking
- Server-side scoring
- Assessment attempt history
- Recruitment status workflows
- Cloudflare deployment

## Roadmap

Potential future improvements include:

- Production-grade assessment authoring UI
- Timed assessments
- Additional assessment question types
- Candidate search and filtering
- Interview scheduling
- Notifications and email workflows
- Recruiter analytics
- Resume file uploads
- Advanced candidate scoring
- Audit logging
- Production observability and monitoring

## Author

Rehan Saifi
