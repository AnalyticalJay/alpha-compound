import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const e2eRole = process.env.E2E_TEST_MODE === "true" ? opts.req.header("x-e2e-role") : null;
  if (e2eRole === "customer" || e2eRole === "admin") {
    // Available only on the isolated Playwright server; never enabled in normal development or production.
    user = {
      id: e2eRole === "admin" ? 9902 : 9901,
      openId: `e2e-${e2eRole}`,
      email: `${e2eRole}@e2e.local`,
      fullName: `E2E ${e2eRole}`,
      loginMethod: "e2e",
      role: e2eRole === "admin" ? "admin" : "user",
      status: "approved",
      isActive: true,
      isOver18: true,
      phone: null,
      city: null,
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User;
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
