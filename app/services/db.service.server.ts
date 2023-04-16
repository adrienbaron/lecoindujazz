import { and, eq, gt } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";

import {
  lockedSeatsTable,
  purchasedSeatsTable,
  purchaseTable,
} from "~/models/dbSchema";
import type { UnavailableSeat } from "~/utils/seatMap";

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

export const getAllUnavailableSeatsForShow = async (
  db: DrizzleD1Database,
  showId: string
): Promise<UnavailableSeat[]> => {
  const [lockedSeats, purchasedSeats] = await Promise.all([
    db
      .select({
        seatId: lockedSeatsTable.seatId,
      })
      .from(lockedSeatsTable)
      .where(
        and(
          eq(lockedSeatsTable.showId, showId),
          gt(lockedSeatsTable.lockedUntil, new Date())
        )
      )
      .all(),
    db
      .select({
        seatId: purchasedSeatsTable.seatId,
      })
      .from(purchasedSeatsTable)
      .where(eq(purchasedSeatsTable.showId, showId))
      .all(),
  ]);

  return [
    ...lockedSeats.map((seat) => ({
      showId,
      seatId: seat.seatId,
      reason: "locked" as const,
    })),
    ...purchasedSeats.map((seat) => ({
      showId,
      seatId: seat.seatId,
      reason: "purchased" as const,
    })),
  ];
};

export async function getLockedSeatsForSession(
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

export async function registerPurchase(
  db: DrizzleD1Database,
  stripeCheckoutSessionId: string,
  customerDetails: { name: string; email: string }
) {
  const seats = await db
    .select()
    .from(lockedSeatsTable)
    .where(
      eq(lockedSeatsTable.stripeCheckoutSessionId, stripeCheckoutSessionId)
    )
    .all();

  if (!seats.length) {
    throw new Error("No seats found for checkout session");
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(purchaseTable)
      .values({
        id: stripeCheckoutSessionId,
        name: customerDetails.name,
        email: customerDetails.email,
      })
      .run();

    await tx
      .insert(purchasedSeatsTable)
      .values(
        seats.map(({ showId, seatId }) => ({
          showId,
          seatId,
          purchaseId: stripeCheckoutSessionId,
        }))
      )
      .run();

    await tx
      .delete(lockedSeatsTable)
      .where(
        eq(lockedSeatsTable.stripeCheckoutSessionId, stripeCheckoutSessionId)
      )
      .run();
  });
}
