import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: 'dummy',
    databaseId: 'local-d1-placeholder',
    token: 'dummy',
  },
} satisfies Config;
