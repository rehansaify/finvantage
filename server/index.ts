import { Hono } from 'hono';
import { createAuth } from './auth';

import orgApp from './api/organizations';
import businessApp from './api/business';

import { requireOrg } from './middleware';

const app = new Hono<{ Bindings: Env }>();

app.route('/api/organizations', orgApp);
app.route('/api', businessApp);

// Test routes for authorization middleware
app.get('/api/test/bank', requireOrg(['BANK']), (c) => c.json({ success: true, message: 'Bank route' }));
app.get('/api/test/college', requireOrg(['COLLEGE']), (c) => c.json({ success: true, message: 'College route' }));
app.get('/api/test/finvantage', requireOrg(['FINVANTAGE']), (c) => c.json({ success: true, message: 'FinVantage route' }));

// Mount Better Auth endpoints
app.all('/api/auth/*', async (c) => {
  console.log("=== API AUTH HIT ===");
  console.log("Method:", c.req.method, "URL:", c.req.url);
  try {
    const auth = createAuth(c.env);
    console.log("Auth initialized");
    const res = await auth.handler(c.req.raw);
    console.log("Auth response status:", res.status);
    return res;
  } catch (err: any) {
    console.error("Auth handler error!!!:", err);
    return c.json({ error: err.message, stack: err.stack }, 500);
  }
});

// Example API Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'FinVantage API is running' });
});

import { getDb } from './db';
import { user } from './db/schema';

app.get('/api/test-db', async (c) => {
  try {
    const db = getDb(c.env);
    await db.insert(user).values({
      id: "test-id-" + Date.now(),
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const users = await db.select().from(user);
    return c.json({ success: true, count: users.length });
  } catch (e: any) {
    return c.json({ success: false, error: e.message, stack: e.stack });
  }
});

app.onError((err, c) => {
  console.error("Hono error:", err);
  return c.json({ error: err.message }, 500);
});

export default app;
