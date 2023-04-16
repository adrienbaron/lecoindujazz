import { and, eq, gt } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";

import { lockedSeatsTable } from "~/models/dbSchema";

const contextWithDb = (
  context: Record<string, unknown>
): context is { DB: D1Database } => {
  return "DB" in context;
};

export const getDbFromContext = (
  context: Record<string, unknown>
): DrizzleD1Database => {
  if (!contextWithDb(context)) {
    throw new Error("No database in context");
  }

  return drizzle(context.DB);
};

export async function getSeatLocksForSession(
  db: DrizzleD1Database,
  sessionId: string
) {
  return await db
    .select()
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.sessionId, sessionId),
        gt(lockedSeatsTable.lockedUntil, new Date())
      )
    )
    .all();
}
