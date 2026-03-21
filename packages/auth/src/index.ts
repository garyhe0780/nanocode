import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@nanodb/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {}),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3002",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    // Google OAuth - configure with env vars
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    generateId: () => {
      return crypto.randomUUID();
    },
  },
});

// Type exports
export type Auth = typeof auth;
