import { and, eq, gt, inArray } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from "uuid";

import type { LockedSeatModel } from "~/models/dbSchema";
import {
  lockedSeatsTable,
  purchasedSeatsTable,
  purchaseTable,
} from "~/models/dbSchema";
import type { UnavailableSeat } from "~/models/seatMap";

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

export const getPurchasedSeatsIdForShow = async (
  db: DrizzleD1Database,
  showId: string
): Promise<string[]> => {
  const purchasedSeats = await db
    .select({
      seatId: purchasedSeatsTable.seatId,
    })
    .from(purchasedSeatsTable)
    .where(eq(purchasedSeatsTable.showId, showId))
    .all();

  return purchasedSeats.map((seat) => seat.seatId);
};

export const getLockedSeatsForShow = async (
  db: DrizzleD1Database,
  showId: string
): Promise<Pick<LockedSeatModel, "seatId" | "sessionId" | "lockedUntil">[]> => {
  return await db
    .select({
      seatId: lockedSeatsTable.seatId,
      sessionId: lockedSeatsTable.sessionId,
      lockedUntil: lockedSeatsTable.lockedUntil,
    })
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        gt(lockedSeatsTable.lockedUntil, new Date())
      )
    )
    .all();
};

export const getAllUnavailableSeatsForShow = async (
  db: DrizzleD1Database,
  showId: string
): Promise<UnavailableSeat[]> => {
  const [lockedSeats, purchasedSeats] = await Promise.all([
    getLockedSeatsForShow(db, showId),
    getPurchasedSeatsIdForShow(db, showId),
  ]);

  return [
    ...lockedSeats.map((seat) => ({
      showId,
      seatId: seat.seatId,
      reason: "locked" as const,
    })),
    ...purchasedSeats.map((seatId) => ({
      showId,
      seatId: seatId,
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

  await db
    .insert(purchaseTable)
    .values({
      id: stripeCheckoutSessionId,
      name: customerDetails.name,
      email: customerDetails.email,
    })
    .run();

  await db
    .insert(purchasedSeatsTable)
    .values(
      seats.map(({ showId, seatId }) => ({
        showId,
        seatId,
        purchaseId: stripeCheckoutSessionId,
      }))
    )
    .run();

  await db
    .delete(lockedSeatsTable)
    .where(
      eq(lockedSeatsTable.stripeCheckoutSessionId, stripeCheckoutSessionId)
    )
    .run();
}

export const adminLockAndUnlockSeats = async (
  db: DrizzleD1Database,
  showId: string,
  selectedSeatsId: string[]
): Promise<void> => {
  const [lockedSeats, purchasedSeats] = await Promise.all([
    getLockedSeatsForShow(db, showId),
    getPurchasedSeatsIdForShow(db, showId),
  ]);

  const lockedSeatsIdSet = new Set(lockedSeats.map((seat) => seat.seatId));
  const purchasedSeatsIdSet = new Set(purchasedSeats);

  const lockedSeatsToUnlock = selectedSeatsId.filter((selectedSeatId) =>
    lockedSeatsIdSet.has(selectedSeatId)
  );
  const purchasedSeatsToUnlock = selectedSeatsId.filter((selectedSeatId) =>
    purchasedSeatsIdSet.has(selectedSeatId)
  );
  const seatsToMarkAsPurchased = selectedSeatsId.filter(
    (selectedSeatId) =>
      !lockedSeatsIdSet.has(selectedSeatId) &&
      !purchasedSeatsIdSet.has(selectedSeatId)
  );

  const adminPurchaseId = `ADMIN:${uuidv4()}`;
  if (seatsToMarkAsPurchased.length > 0) {
    await db
      .insert(purchaseTable)
      .values({
        id: adminPurchaseId,
        name: "Admin",
        email: "",
      })
      .run();
  }

  await Promise.all([
    lockedSeatsToUnlock.length > 0 &&
      db
        .delete(lockedSeatsTable)
        .where(
          and(
            eq(lockedSeatsTable.showId, showId),
            inArray(lockedSeatsTable.seatId, lockedSeatsToUnlock)
          )
        )
        .run(),
    purchasedSeatsToUnlock.length > 0 &&
      db
        .delete(purchasedSeatsTable)
        .where(
          and(
            eq(purchasedSeatsTable.showId, showId),
            inArray(purchasedSeatsTable.seatId, purchasedSeatsToUnlock)
          )
        )
        .run(),
    seatsToMarkAsPurchased.length > 0 &&
      db
        .insert(purchasedSeatsTable)
        .values(
          seatsToMarkAsPurchased.map((seatId) => ({
            showId,
            seatId,
            purchaseId: adminPurchaseId,
          }))
        )
        .run(),
  ]);
};
