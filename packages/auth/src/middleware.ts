import { auth } from "./index";
import type { Request } from "bun";

export async function getSession(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const authorizationHeader = req.headers.get("authorization");

  const sessionToken =
    cookieHeader
      ?.split(";")
      ?.find((c) => c.trim().startsWith("better-auth.session_token="))
      ?.split("=")[1]
      ?.trim() ||
    authorizationHeader?.replace("Bearer ", "");

  if (!sessionToken) {
    return null;
  }

  const context = await auth.$context;
  const session = await context.db.collection("session").findFirst({
    where: {
      token: { equals: sessionToken },
    },
  });

  if (!session || new Date(session.expires) < new Date()) {
    return null;
  }

  const user = await context.db.collection("user").findFirst({
    where: { id: { equals: session.userId } },
  });

  return { session, user };
}

export async function requireAuth(req: Request) {
  const result = await getSession(req);
  if (!result?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return result;
}
