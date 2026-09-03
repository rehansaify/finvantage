const email = "phase2c_final@example.com";
const password = "Password123!";
const headers = { "Content-Type": "application/json", "Origin": "http://127.0.0.1:8787" };

(async () => {
  console.log("--- PHASE 2C TEST ---");
  
  // 4. Registration
  const reg = await fetch("http://127.0.0.1:8787/api/auth/sign-up/email", {
    method: "POST", headers, body: JSON.stringify({ email, password, name: "Phase 2C Tester" })
  });
  console.log("Registration:", reg.status);
  
  // 5. Login
  const login = await fetch("http://127.0.0.1:8787/api/auth/sign-in/email", {
    method: "POST", headers, body: JSON.stringify({ email, password })
  });
  console.log("Login:", login.status);
  
  const setCookie = login.headers.get("set-cookie");
  const authHeaders = { ...headers, "Cookie": setCookie };

  // 7. Session Persistence
  const session = await fetch("http://127.0.0.1:8787/api/auth/get-session", { headers: authHeaders });
  console.log("Session Persistence:", session.status);
  
  // 8. Invalid Credentials
  const badLogin = await fetch("http://127.0.0.1:8787/api/auth/sign-in/email", {
    method: "POST", headers, body: JSON.stringify({ email, password: "wrong" })
  });
  console.log("Invalid Credentials:", badLogin.status);

  // 10. Candidate Context Authorization
  const candTest = await fetch("http://127.0.0.1:8787/api/test/bank", { headers: authHeaders });
  console.log("Candidate Context (No Org) Bank access blocked:", candTest.status === 403 ? "PASS" : "FAIL", candTest.status);

  // Create a Bank Org
  const bank = await fetch("http://127.0.0.1:8787/api/organizations", {
    method: "POST", headers: authHeaders, body: JSON.stringify({ name: "CBank", slug: "cbank-" + Date.now(), type: "BANK" })
  });
  const bankData = await bank.json();
  const bankId = bankData.organization.id;
  console.log("Created Bank Org:", bank.status);

  // Set active organization to Bank
  const setActive1 = await fetch("http://127.0.0.1:8787/api/auth/organization/set-active", {
    method: "POST", headers: authHeaders, body: JSON.stringify({ organizationId: bankId })
  });
  if (setActive1.headers.get("set-cookie")) authHeaders["Cookie"] = setActive1.headers.get("set-cookie");
  
  // 11. BANK Authorization & 14. Unauthorized Access
  const bankAuth1 = await fetch("http://127.0.0.1:8787/api/test/bank", { headers: authHeaders });
  console.log("Bank accessing Bank Route:", bankAuth1.status === 200 ? "PASS" : "FAIL", bankAuth1.status);
  
  const bankAuth2 = await fetch("http://127.0.0.1:8787/api/test/college", { headers: authHeaders });
  console.log("Bank accessing College Route (blocked):", bankAuth2.status === 403 ? "PASS" : "FAIL", bankAuth2.status);

  // 15 & 16. Member List Authorization & Retrieval
  const members = await fetch(`http://127.0.0.1:8787/api/organizations/${bankId}/members`, { headers: authHeaders });
  const membersData = await members.json();
  console.log("Member List Access:", members.status === 200 ? "PASS" : "FAIL", members.status);
  console.log("Member List Content Valid:", Array.isArray(membersData.members) && membersData.members[0].user.email === email ? "PASS" : "FAIL");

  // Create a College Org
  const college = await fetch("http://127.0.0.1:8787/api/organizations", {
    method: "POST", headers: authHeaders, body: JSON.stringify({ name: "CCollege", slug: "ccollege-" + Date.now(), type: "COLLEGE" })
  });
  const colData = await college.json();
  
  // Set active organization to College
  const setActive2 = await fetch("http://127.0.0.1:8787/api/auth/organization/set-active", {
    method: "POST", headers: authHeaders, body: JSON.stringify({ organizationId: colData.organization.id })
  });
  if (setActive2.headers.get("set-cookie")) authHeaders["Cookie"] = setActive2.headers.get("set-cookie");

  // 12. COLLEGE Authorization
  const colAuth1 = await fetch("http://127.0.0.1:8787/api/test/college", { headers: authHeaders });
  console.log("College accessing College Route:", colAuth1.status === 200 ? "PASS" : "FAIL", colAuth1.status);

  // 6. Logout
  const logout = await fetch("http://127.0.0.1:8787/api/auth/sign-out", { method: "POST", headers: authHeaders });
  console.log("Logout Status:", logout.status);
})();
