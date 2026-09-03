import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { getDb } from "./db";
import * as schema from "./db/schema";

export function createAuth(env: Env) {
  return betterAuth({
    logger: {
      level: "debug",
    },

    baseURL: env.BETTER_AUTH_URL,

    trustedOrigins: [
      env.BETTER_AUTH_URL,
    ],

    secret: env.BETTER_AUTH_SECRET,

    database: drizzleAdapter(getDb(env), {
      provider: "sqlite",
      schema: {
        ...schema
      }
    }),

    emailAndPassword: {
      enabled: true
    },

    plugins: [
      organization({
        schema: {
          organization: {
            fields: {
              type: "string"
            }
          }
        }
      })
    ]
  });
}