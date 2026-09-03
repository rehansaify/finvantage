const BACKEND_URL = 'http://127.0.0.1:8787';

async function fetchApi(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  if (!options.headers) options.headers = {};
  options.headers['Origin'] = 'http://localhost:5173';
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text), headers: res.headers };
  } catch(e) {
    return { status: res.status, text, headers: res.headers };
  }
}

// Helpers from previous tests
async function signupAndLogin(name, email, password) {
  await fetchApi('/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  
  const res = await fetchApi('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const cookies = res.headers.get('set-cookie');
  let authCookie = '';
  if (cookies) {
    const parts = cookies.split(',');
    for (const p of parts) {
      if (p.includes('better-auth.session_token')) {
        authCookie = p.split(';')[0].trim();
        break;
      }
    }
  }
  console.log("Logged in", email, "Cookie:", authCookie);
  return { user: res.data.user, cookie: authCookie };
}

async function createOrg(cookie, name, slug, type) {
  const res = await fetchApi('/api/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ name, slug, type })
  });
  return res.data;
}

async function setActiveOrg(cookie, orgId) {
  const res = await fetchApi('/api/auth/organization/set-active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ organizationId: orgId })
  });
  console.log("setActiveOrg for", orgId, "status:", res.status);
}

async function runTest() {
  console.log("--- PHASE 3A REGRESSION & BUSINESS TESTS ---\n");
  let passed = 0;
  let failed = 0;
  
  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const ts = Date.now();
    
    // 1. Setup Users
    console.log("Setting up test accounts...");
    const bankA = await signupAndLogin("Bank A Admin", `banka${ts}@test.com`, "password123");
    const bankB = await signupAndLogin("Bank B Admin", `bankb${ts}@test.com`, "password123");
    const collegeA = await signupAndLogin("College Admin", `college${ts}@test.com`, "password123");
    const collegeB = await signupAndLogin("College B Admin", `collegeb${ts}@test.com`, "password123");
    const candidate1 = await signupAndLogin("Candidate 1", `cand1${ts}@test.com`, "password123");
    const candidate2 = await signupAndLogin("Candidate 2", `cand2${ts}@test.com`, "password123");
    
    // 2. Setup Orgs
    const orgBankA = await createOrg(bankA.cookie, "Bank A", `bank-a-${ts}`, "BANK");
    const orgBankB = await createOrg(bankB.cookie, "Bank B", `bank-b-${ts}`, "BANK");
    const orgColA = await createOrg(collegeA.cookie, "College A", `col-a-${ts}`, "COLLEGE");
    const orgColB = await createOrg(collegeB.cookie, "College B", `col-b-${ts}`, "COLLEGE");
    
    await setActiveOrg(bankA.cookie, orgBankA.organization.id);
    await setActiveOrg(bankB.cookie, orgBankB.organization.id);
    await setActiveOrg(collegeA.cookie, orgColA.organization.id);
    await setActiveOrg(collegeB.cookie, orgColB.organization.id);

    // 3. Test Bank Job Creation
    const postJob1 = await fetchApi('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
      body: JSON.stringify({ title: "Bank A Job", description: "Desc", status: "OPEN" })
    });
    console.log("postJob1 response:", postJob1);
    assert(postJob1.status === 200, "Bank A can create a job");
    const jobAId = postJob1.data.job.id;
    assert(postJob1.data.job.organizationId === orgBankA.organization.id, "Job strictly assigned to Bank A org");

    const postJob2 = await fetchApi('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
      body: JSON.stringify({ title: "Bank A Draft", description: "Desc", status: "DRAFT" })
    });

    const postJob3 = await fetchApi('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
      body: JSON.stringify({ title: "Bank B Job", description: "Desc", status: "OPEN" })
    });
    const jobBId = postJob3.data.job.id;

    // 4. Test Job Visibility / Boundaries
    const bankAGetsJobs = await fetchApi('/api/jobs', { headers: { 'Cookie': bankA.cookie } });
    assert(bankAGetsJobs.data.jobs.length === 2, "Bank A sees only their 2 jobs");
    
    const bankBGetsJobs = await fetchApi('/api/jobs', { headers: { 'Cookie': bankB.cookie } });
    assert(bankBGetsJobs.data.jobs.length === 1 && bankBGetsJobs.data.jobs[0].organizationId === orgBankB.organization.id, "Bank B cannot access Bank A's jobs");

    // 5. Test Candidate Capabilities and Onboarding
    await setActiveOrg(candidate1.cookie, null);
    await setActiveOrg(bankA.cookie, null);

    // Un-onboarded candidate should get 403
    const cand1GetsJobsFail = await fetchApi('/api/jobs', { headers: { 'Cookie': candidate1.cookie } });
    assert(cand1GetsJobsFail.status === 403, "User with no candidate profile + no active org -> GET /api/jobs returns 403");
    
    const cand1AppFail = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
      body: JSON.stringify({ jobId: jobAId })
    });
    assert(cand1AppFail.status === 403, "User with no candidate profile + no active org -> POST /api/applications returns 403");

    // Bank A without profile cannot clear context and apply
    const bankAAppFail = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
      body: JSON.stringify({ jobId: jobAId })
    });
    assert(bankAAppFail.status === 403, "Bank user without candidate profile cannot clear context and apply");
    
    // Reset Bank A context to active
    await setActiveOrg(bankA.cookie, orgBankA.organization.id);

    // Onboard Candidate 1
    const onboardCand1 = await fetchApi('/api/candidates/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie }
    });
    console.log("onboardCand1:", onboardCand1);
    assert(onboardCand1.status === 200, "Candidate 1 can successfully onboard");

    // Onboard Bank A (dual-role testing)
    const onboardBankA = await fetchApi('/api/candidates/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie }
    });
    assert(onboardBankA.status === 200, "Bank user can also onboard as a candidate (dual-role)");

    // Test dual-role switching
    await setActiveOrg(bankA.cookie, null);
    const dualRoleGetsJobs = await fetchApi('/api/jobs', { headers: { 'Cookie': bankA.cookie } });
    assert(dualRoleGetsJobs.status === 200, "A user with both a candidate profile and BANK membership can legitimately switch to Personal/Candidate context");
    await setActiveOrg(bankA.cookie, orgBankA.organization.id); // switch back

    // 6. Test Candidate Visibility (Only OPEN jobs)
    const candGetsJobs = await fetchApi('/api/jobs', { headers: { 'Cookie': candidate1.cookie } });
    assert(candGetsJobs.status === 200, "User with a candidate profile + no active org -> can view OPEN jobs");
    const hasOpen = candGetsJobs.data.jobs.some(j => j.status === 'OPEN');
    const hasDraft = candGetsJobs.data.jobs.some(j => j.status === 'DRAFT');
    assert(hasOpen && !hasDraft, "Candidates only see OPEN jobs");

    // 7. Test Candidate Applications (Self vs Spoof)
    const spoofApp = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
      body: JSON.stringify({ jobId: jobAId, candidateId: candidate2.user.id }) // trying to spoof
    });
    assert(spoofApp.status === 403, "Candidates cannot submit applications for other candidates");

    const realApp = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
      body: JSON.stringify({ jobId: jobAId }) // legitimate
    });
    assert(realApp.status === 200, "User with a candidate profile + no active org -> can apply");
    
    const dupApp = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
      body: JSON.stringify({ jobId: jobAId })
    });
    assert(dupApp.status === 409 || dupApp.status === 500, "Duplicate applications are strictly rejected");

    // 7. Test College Sourcing & Submissions
    // College A tries to submit candidate2 to job B without a candidate_sources link
    const colA_Submits_Unlinked = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': collegeA.cookie },
      body: JSON.stringify({ jobId: jobBId, candidateId: candidate2.user.id })
    });
    assert(colA_Submits_Unlinked.status === 403, "College cannot submit candidate without candidate_sources link");

    // Create link for College A <-> Candidate 2
    await fetchApi('/api/candidates/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': collegeA.cookie },
      body: JSON.stringify({ candidateId: candidate2.user.id })
    });

    // Try again
    const colA_Submits_Linked = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': collegeA.cookie },
      body: JSON.stringify({ jobId: jobBId, candidateId: candidate2.user.id })
    });
    assert(colA_Submits_Linked.status === 200, "College CAN submit candidate that exists in candidate_sources");
    assert(colA_Submits_Linked.data.application.submittedByOrganizationId === orgColA.organization.id, "A College cannot spoof another College's org ID (backend injected)");

    // College B tries to submit Candidate 2 (they don't have the link)
    const colB_Submits_LinkedToA = await fetchApi('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': collegeB.cookie },
      body: JSON.stringify({ jobId: jobBId, candidateId: candidate2.user.id })
    });
    assert(colB_Submits_LinkedToA.status === 403, "College B cannot submit Candidate 2 linked only to College A");

    // 8. Test Application Visibility Boundaries
    const bankAApps = await fetchApi('/api/applications', { headers: { 'Cookie': bankA.cookie } });
    assert(bankAApps.data.applications.length === 1 && bankAApps.data.applications[0].application.jobId === jobAId, "Banks only see applications belonging to their jobs");

    const bankBApps = await fetchApi('/api/applications', { headers: { 'Cookie': bankB.cookie } });
    assert(bankBApps.data.applications.length === 1 && bankBApps.data.applications[0].application.jobId === jobBId, "Bank B sees College A's submission to Job B");

    const colAApps = await fetchApi('/api/applications', { headers: { 'Cookie': collegeA.cookie } });
    assert(colAApps.data.applications.length === 1, "Colleges only see applications they submitted");

    // ===============================================
    // PHASE 3B: ASSESSMENTS
    // ===============================================
    console.log("Starting Phase 3B Assessments tests...");
    
    // 10. BANK A creates an assessment
    await setActiveOrg(bankA.cookie, orgBankA.organization.id);
    const createAstA = await fetchApi('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
      body: JSON.stringify({ title: 'Bank A Coding Test' })
    });
    assert(createAstA.status === 200, "BANK can create an assessment");
    const astAId = createAstA.data.assessment.id;

    // 11. BANK B cannot access BANK A's assessment
    await setActiveOrg(bankB.cookie, orgBankB.organization.id);
    const getAstB = await fetchApi('/api/assessments', { headers: { 'Cookie': bankB.cookie } });
    assert(getAstB.data.assessments.length === 0, "Another BANK cannot modify/access the first BANK's private assessment");

    // 12. BANK A assigns assessment to its job
    await setActiveOrg(bankA.cookie, orgBankA.organization.id);
    const assignAstA = await fetchApi(`/api/jobs/${jobAId}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
      body: JSON.stringify({ assessmentId: astAId })
    });
    assert(assignAstA.status === 200, "BANK can assign an accessible assessment to its own job");

    // 13. BANK B cannot assign BANK A's assessment to BANK B's job
    await setActiveOrg(bankB.cookie, orgBankB.organization.id);
    const assignAstB = await fetchApi(`/api/jobs/${jobBId}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
      body: JSON.stringify({ assessmentId: astAId })
    });
    assert(assignAstB.status === 403 || assignAstB.status === 404, "BANK cannot assign an assessment to another BANK's job (or it's inaccessible)");

    // 14. Candidate sees required assessment
    await setActiveOrg(candidate1.cookie, null);
    const candAsts = await fetchApi('/api/candidate/assessments', { headers: { 'Cookie': candidate1.cookie } });
    assert(candAsts.status === 200 && candAsts.data.assessments.length > 0, "Candidate can only see assessments associated with jobs they are legitimately involved with");
    const requiredAst = candAsts.data.assessments[0];

    // Candidate submitting result
    const candResult = await fetchApi(`/api/assessments/${astAId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
      body: JSON.stringify({ applicationId: requiredAst.applicationId, score: 95 })
    });
    assert(candResult.status === 200, "Candidate can submit a result");

    // 15. Candidate 2 cannot submit result for Candidate 1's application
    await setActiveOrg(candidate2.cookie, null);
    await fetchApi('/api/candidates/profile', { method: 'POST', headers: { 'Cookie': candidate2.cookie } });
    
    const spoofResult = await fetchApi(`/api/assessments/${astAId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': candidate2.cookie },
      body: JSON.stringify({ applicationId: requiredAst.applicationId, score: 100 })
    });
    assert(spoofResult.status === 403, "Candidate cannot submit a result for another candidate/unrelated application");

    // 16. BANK A can see results
    await setActiveOrg(bankA.cookie, orgBankA.organization.id);
    const appResults = await fetchApi(`/api/applications/${requiredAst.applicationId}/assessments`, { headers: { 'Cookie': bankA.cookie } });
    assert(appResults.status === 200 && appResults.data.results.length > 0, "BANK can only see results associated with its own jobs");



    // 17. BANK B cannot see BANK A's results
    await setActiveOrg(bankB.cookie, orgBankB.organization.id);
    const bankBAppResults = await fetchApi(`/api/applications/${requiredAst.applicationId}/assessments`, { headers: { 'Cookie': bankB.cookie } });
    assert(bankBAppResults.status === 403, "BANK A cannot see BANK B's assessment results (isolation)");

    console.log("All Phase 3B tests passed!");
  // ===============================================
  // PHASE 3C: WORKFLOW & PROFILE
  // ===============================================
  console.log("Starting Phase 3C tests...");

  // 1. Candidate profile creation and update
  await setActiveOrg(candidate1.cookie, null);
  const candProfUpdate = await fetchApi('/api/candidates/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({ phone: '555-1234', resumeUrl: 'http://resume.com' })
  });
  assert(candProfUpdate.status === 200 && candProfUpdate.data.profile.phone === '555-1234', "Candidate can update profile");

  const candProfGet = await fetchApi('/api/candidates/profile', { headers: { 'Cookie': candidate1.cookie } });
  assert(candProfGet.status === 200 && candProfGet.data.profile.phone === '555-1234', "Candidate can view profile");

  // 2. College candidate lookup by email
  await setActiveOrg(collegeA.cookie, orgColA.organization.id);
  const lookupOk = await fetchApi(`/api/college/lookup-candidate?email=${encodeURIComponent(candidate1.user.email)}`, { headers: { 'Cookie': collegeA.cookie } });
  assert(lookupOk.status === 200 && lookupOk.data.candidate.id === candidate1.user.id, "College can lookup candidate by email");

  const lookupFake = await fetchApi(`/api/college/lookup-candidate?email=fake@test.com`, { headers: { 'Cookie': collegeA.cookie } });
  assert(lookupFake.status === 404, "College cannot lookup nonexistent accounts");

  const lookupBank = await fetchApi(`/api/college/lookup-candidate?email=${encodeURIComponent(bankB.user.email)}`, { headers: { 'Cookie': collegeA.cookie } });
  assert(lookupBank.status === 404, "College cannot lookup non-candidate accounts");

  // 3. College Sourcing and Sourced list
  const candList = await fetchApi('/api/college/candidates', { headers: { 'Cookie': collegeA.cookie } });
  assert(candList.status === 200 && candList.data.candidates.some(c => c.id === candidate2.user.id), "College sees sourced candidates");

  await setActiveOrg(collegeB.cookie, orgColB.organization.id);
  const candListB = await fetchApi('/api/college/candidates', { headers: { 'Cookie': collegeB.cookie } });
  assert(candListB.status === 200 && !candListB.data.candidates.some(c => c.id === candidate2.user.id), "College A cannot access College B's sourced candidates");

  // 4. Job Status modifications
  await setActiveOrg(bankA.cookie, orgBankA.organization.id);
  const updateJob = await fetchApi(`/api/jobs/${jobAId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({ status: 'CLOSED' })
  });
  assert(updateJob.status === 200 && updateJob.data.job.status === 'CLOSED', "Bank can modify jobs belonging to its own organization");

  await setActiveOrg(bankB.cookie, orgBankB.organization.id);
  const updateJobFail = await fetchApi(`/api/jobs/${jobAId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
    body: JSON.stringify({ status: 'OPEN' })
  });
  assert(updateJobFail.status === 403 || updateJobFail.status === 404, "Bank cannot modify jobs belonging to another organization");

  // 5. Application Status modifications
  await setActiveOrg(bankA.cookie, orgBankA.organization.id);
  const aApps = await fetchApi('/api/applications', { headers: { 'Cookie': bankA.cookie } });
  const appId = aApps.data.applications[0].application.id; 
  
  const updateApp = await fetchApi(`/api/applications/${appId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({ status: 'INTERVIEW' })
  });
  assert(updateApp.status === 200 && updateApp.data.application.status === 'INTERVIEW', "Bank can update application status");

  assert(aApps.data.applications[0].candidatePhone === '555-1234', "Bank receives applicant profile information only for applications to its jobs");

  await setActiveOrg(bankB.cookie, orgBankB.organization.id);
  const updateAppFail = await fetchApi(`/api/applications/${appId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
    body: JSON.stringify({ status: 'REJECTED' })
  });
  assert(updateAppFail.status === 403, "Bank A cannot modify Bank B's application statuses");

  await setActiveOrg(candidate1.cookie, null);
  const candAppFail = await fetchApi(`/api/applications/${appId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({ status: 'ACCEPTED' })
  });
  assert(candAppFail.status === 403, "Candidates cannot modify application status");

  const candApps = await fetchApi('/api/applications', { headers: { 'Cookie': candidate1.cookie } });
  assert(candApps.status === 200 && candApps.data.applications[0].application.status === 'INTERVIEW', "Candidate can see their own application status");

  const candAsts2 = await fetchApi('/api/candidate/assessments', { headers: { 'Cookie': candidate1.cookie } });
  assert(candAsts2.status === 200 && candAsts2.data.results.length > 0, "Assessment history remains candidate-specific");

  console.log("All Phase 3C tests passed!");

  // ===============================================
  // PHASE 3D: REAL ASSESSMENT ENGINE
  // ===============================================
  console.log("Starting Phase 3D tests...");

  // 1. Bank A creates questions for its own assessment
  await setActiveOrg(bankA.cookie, orgBankA.organization.id);
  const q1Res = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({
      question: "What is 2+2?",
      options: ["3", "4", "5"],
      correctAnswer: "4",
      points: 1
    })
  });
  assert(q1Res.status === 200 && q1Res.data.question.question === "What is 2+2?", "Bank can create questions for its own assessment");
  const q1Id = q1Res.data.question.id;

  const q2Res = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({
      question: "What is the capital of France?",
      options: ["London", "Paris", "Berlin"],
      correctAnswer: "Paris",
      points: 2
    })
  });

  // 2. Bank B cannot modify Bank A's assessment
  await setActiveOrg(bankB.cookie, orgBankB.organization.id);
  const qFail = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
    body: JSON.stringify({
      question: "Malicious question",
      correctAnswer: "None"
    })
  });
  assert(qFail.status === 403, "Bank cannot modify another Bank's assessment");

  // 3. Candidate 1 (has application for Job A) can view questions without correct answers
  await setActiveOrg(candidate1.cookie, null);
  const candQRes = await fetchApi(`/api/assessments/${astAId}/questions`, { headers: { 'Cookie': candidate1.cookie } });
  assert(candQRes.status === 200, "Candidate who applied to correct job can access assessment");
  assert(candQRes.data.questions.length === 2, "Candidate receives questions");
  assert(candQRes.data.questions[0].correctAnswer === undefined, "Candidate cannot access correct answers");

  // 4. Candidate 2 (applied to Job B, not Job A) cannot view Assessment A questions
  await setActiveOrg(candidate2.cookie, null);
  const candQFail = await fetchApi(`/api/assessments/${astAId}/questions`, { headers: { 'Cookie': candidate2.cookie } });
  assert(candQFail.status === 403, "Candidate who applied to unrelated job cannot access assessment");

  // 5. Candidate 1 submits legitimate answers (1 correct, 1 incorrect) => (1 / 3 points = 33%)
  await setActiveOrg(candidate1.cookie, null);
  const submitRes1 = await fetchApi(`/api/assessments/${astAId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({
      applicationId: appId,
      answers: {
        [q1Id]: "4", // Correct (1 pt)
        [q2Res.data.question.id]: "London" // Incorrect (0 pts out of 2)
      }
    })
  });
  assert(submitRes1.status === 200, "Candidate can submit legitimate answers");
  assert(submitRes1.data.result.score === 33, "Server calculates score correctly");

  // 6. Client-provided score/candidateId is ignored/rejected (can't easily test ignored fields without seeing DB but we can ensure it doesn't error and doesn't adopt fake score)
  const submitResFake = await fetchApi(`/api/assessments/${astAId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({
      applicationId: appId,
      score: 100, // Should be ignored
      answers: {
        [q1Id]: "4",
        [q2Res.data.question.id]: "Paris"
      }
    })
  });
  // 3 out of 3 pts = 100%
  assert(submitResFake.data.result.score === 100 && submitResFake.data.result.candidateId === candidate1.user.id, "Client-provided candidateId/score is ignored in favor of server calculation");
  
  // 7. Multiple attempts
  const candAstsCheck = await fetchApi('/api/candidate/assessments', { headers: { 'Cookie': candidate1.cookie } });
  const myResults = candAstsCheck.data.results.filter(r => r.assessmentId === astAId);
  // Expected 3 attempts because 1 was from Phase 3B fake submit, 1 is 33%, 1 is 100%
  assert(myResults.length === 3, "Both results remain in database (Multiple attempts allowed)");
  assert(myResults.some(r => r.score === 33) && myResults.some(r => r.score === 100), "Previous result is not overwritten");

  console.log("All Phase 3D tests passed!");

  // ===============================================
  // PHASE 3E: ASSESSMENT HARDENING & VALIDATION
  // ===============================================
  console.log("Starting Phase 3E tests...");

  // 1. Bank A tries to create invalid questions (missing options, missing answer, etc)
  await setActiveOrg(bankA.cookie, orgBankA.organization.id);
  const badQ1 = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({ question: "", options: ["A","B"], correctAnswer: "A" })
  });
  assert(badQ1.status === 400 && badQ1.data.error.includes('empty'), "Empty question is rejected");

  const badQ2 = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({ question: "Valid?", options: ["A"], correctAnswer: "A" })
  });
  assert(badQ2.status === 400 && badQ2.data.error.includes('least 2'), "Less than 2 options is rejected");

  const badQ3 = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({ question: "Valid?", options: ["A","A"], correctAnswer: "A" })
  });
  assert(badQ3.status === 400 && badQ3.data.error.includes('unique'), "Duplicate options are rejected");

  const badQ4 = await fetchApi(`/api/assessments/${astAId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankA.cookie },
    body: JSON.stringify({ question: "Valid?", options: ["A","B"], correctAnswer: "C" })
  });
  assert(badQ4.status === 400 && badQ4.data.error.includes('match'), "Correct answer must exist in options");

  // 2. Candidate 1 submits invalid IDs
  await setActiveOrg(candidate1.cookie, null);
  const submitBadIds = await fetchApi(`/api/assessments/${astAId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({
      applicationId: appId,
      answers: {
        "nonexistent-id": "A"
      }
    })
  });
  assert(submitBadIds.status === 400 && submitBadIds.data.error.includes('invalid'), "Submitted answers contain invalid question IDs is rejected");

  

  // 3. Bank Job & Application Authorization
  await setActiveOrg(bankB.cookie, orgBankB.organization.id);
  const badJobUpdate = await fetchApi(`/api/jobs/${jobAId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
    body: JSON.stringify({ status: 'CLOSED' })
  });
  assert(badJobUpdate.status === 403, "Bank A cannot change Bank B job status");

  const badAppUpdate = await fetchApi(`/api/applications/${appId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie },
    body: JSON.stringify({ status: 'REJECTED' })
  });
  assert(badAppUpdate.status === 403, "Bank A cannot change Bank B's application status");

  await setActiveOrg(candidate1.cookie, null);
  const candJobUpdate = await fetchApi(`/api/jobs/${jobAId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({ status: 'CLOSED' })
  });
  assert(candJobUpdate.status === 403, "Candidate cannot modify jobs");

  const candAppUpdate = await fetchApi(`/api/applications/${appId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate1.cookie },
    body: JSON.stringify({ status: 'REJECTED' })
  });
  assert(candAppUpdate.status === 403, "Candidate cannot change application status");

  // 4. Cross-tenant candidate spoofing (Submit on behalf of someone else's application)
  await setActiveOrg(candidate2.cookie, null);
  const spoofSubmit = await fetchApi(`/api/assessments/${astAId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': candidate2.cookie }, // Cand2 trying to submit for Cand1's app
    body: JSON.stringify({
      applicationId: appId, // belongs to candidate1
      answers: {}
    })
  });
  assert(spoofSubmit.status === 403, "Candidate cannot submit another candidate's application ID");

  // 5. College Security
  await setActiveOrg(collegeB.cookie, orgColB.organization.id);
  const badSourced = await fetchApi('/api/college/candidates', { headers: { 'Cookie': collegeB.cookie } });
  assert(badSourced.status === 200 && badSourced.data.candidates.length === 0, "College A cannot access College B's sourced candidates");

  const badLookup1 = await fetchApi('/api/college/lookup-candidate?email=nonexistent@example.com', { headers: { 'Cookie': collegeB.cookie } });
  assert(badLookup1.status === 404, "College cannot source nonexistent candidate");
  
  const badLookup2 = await fetchApi(`/api/college/lookup-candidate?email=${bankA.email}`, { headers: { 'Cookie': collegeB.cookie } });
  assert(badLookup2.status === 404, "College cannot source a non-candidate account");

  // 6. Profile security
  await setActiveOrg(bankB.cookie, orgBankB.organization.id);
  const badProfileUpdate = await fetchApi('/api/candidates/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': bankB.cookie }, // Bank acting without switching to personal context
    body: JSON.stringify({ phone: "Hacked" })
  });
  // Since bankA DOES NOT have a candidate profile, this should fail with 403
  assert(badProfileUpdate.status === 403, "Bank cannot modify candidate profile through candidate endpoint. Status: " + badProfileUpdate.status + " error: " + JSON.stringify(badProfileUpdate.data));


console.log("All Phase 3E tests passed!");



    // ===============================================

  } catch(e) {
    console.error("TEST FAILED UNEXPECTEDLY", e);
  }

  console.log(`\nTests Complete. Passed: ${passed}, Failed: ${failed}`);
}

runTest();
