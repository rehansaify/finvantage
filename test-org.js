const email = "orgtest@example.com";
const password = "Password123!";
const headers = { "Content-Type": "application/json", "Origin": "http://127.0.0.1:8787" };

(async () => {
  // Register
  const reg = await fetch("http://127.0.0.1:8787/api/auth/sign-up/email", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, name: "Org Tester" })
  });
  console.log("Reg Status:", reg.status);
  
  // Login
  const login = await fetch("http://127.0.0.1:8787/api/auth/sign-in/email", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password })
  });
  console.log("Login Status:", login.status);
  
  const setCookie = login.headers.get("set-cookie");
  const authHeaders = { ...headers, "Cookie": setCookie };

  // Create BANK
  const bank = await fetch("http://127.0.0.1:8787/api/organizations", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Global Bank", slug: "global-bank", type: "BANK" })
  });
  console.log("Create Bank:", bank.status, await bank.text());

  // Create COLLEGE
  const college = await fetch("http://127.0.0.1:8787/api/organizations", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Ivy League", slug: "ivy-league", type: "COLLEGE" })
  });
  console.log("Create College:", college.status, await college.text());

  // Duplicate Slug
  const dup = await fetch("http://127.0.0.1:8787/api/organizations", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Global Bank 2", slug: "global-bank", type: "BANK" })
  });
  console.log("Duplicate Slug:", dup.status, await dup.text());

  // Switch to Bank
  // activeOrganizationId uses internal cookie maybe?
})();
