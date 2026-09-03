const email = "origin_test_" + Date.now() + "@example.com";
const password = "Password123!";
// Simulating the browser hitting the backend from localhost:5173
const headers = { 
  "Content-Type": "application/json", 
  "Origin": "http://localhost:5173" 
};

(async () => {
  console.log("--- TESTING CORS/ORIGIN FIX ---");
  console.log("Using Origin:", headers.Origin);
  
  // 1. Registration
  console.log("Testing Registration...");
  const reg = await fetch("http://127.0.0.1:8787/api/auth/sign-up/email", {
    method: "POST", headers, body: JSON.stringify({ email, password, name: "Origin Tester" })
  });
  console.log("Registration Status:", reg.status);
  
  // 2. Login
  console.log("Testing Login...");
  const login = await fetch("http://127.0.0.1:8787/api/auth/sign-in/email", {
    method: "POST", headers, body: JSON.stringify({ email, password })
  });
  console.log("Login Status:", login.status);
  
  const setCookie = login.headers.get("set-cookie");
  const authHeaders = { ...headers, "Cookie": setCookie };

  // 3. Session Persistence
  console.log("Testing Session Persistence...");
  const session = await fetch("http://127.0.0.1:8787/api/auth/get-session", { headers: authHeaders });
  console.log("Session Status:", session.status);
  
  // 4. Logout
  console.log("Testing Logout...");
  const logout = await fetch("http://127.0.0.1:8787/api/auth/sign-out", { 
    method: "POST", 
    headers: authHeaders,
    body: JSON.stringify({})
  });
  console.log("Logout Status:", logout.status);
})();
