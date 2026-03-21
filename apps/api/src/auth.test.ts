import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { auth } from "@nanodb/auth";
import { prisma } from "@nanodb/db";

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

let server: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
  // Start test server
  server = Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);
      const path = url.pathname;

      if (path.startsWith("/api/auth/")) {
        return auth.handler(req);
      }

      if (path === "/health") {
        return Response.json({ status: "ok" });
      }

      return Response.json({ error: "Not found" }, { status: 404 });
    },
  });

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 500));
});

afterAll(async () => {
  server.stop();
  // Clean up test data
  await prisma.account.deleteMany({
    where: { providerId: "credential" }
  });
  await prisma.user.deleteMany({
    where: { email: { contains: "test_" } }
  });
});

describe("Auth API", () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "testpass123";

  test("POST /api/auth/sign-up/email - should create user and account", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test User",
      }),
    });

    const body = await res.json();
    console.log("Sign-up response:", res.status, body);

    expect(res.status).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);
    expect(body.token).toBeDefined();
  });

  test("POST /api/auth/sign-in/email - should sign in existing user", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const body = await res.json();
    console.log("Sign-in response:", res.status, body);

    expect(res.status).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.token).toBeDefined();
  });

  test("POST /api/auth/sign-in/email - should reject wrong password", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "wrongpassword",
      }),
    });

    const body = await res.json();
    console.log("Wrong password response:", res.status, body);

    expect(res.status).toBe(401);
    expect(body.code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });

  test("POST /api/auth/sign-up/email - should reject duplicate email", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Another User",
      }),
    });

    const body = await res.json();
    console.log("Duplicate sign-up response:", res.status, body);

    expect(res.status).toBe(422);
    expect(body.code).toBe("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL");
  });
});
