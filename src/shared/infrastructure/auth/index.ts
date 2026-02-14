import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3006',
  trustedOrigins: [
    'https://ecommerce.davidfdzmorilla.dev',
    'http://localhost:3006',
    'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
