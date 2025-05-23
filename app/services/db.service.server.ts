import { and, eq, gt, inArray } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";

import type { LockedSeatModel, PurchasedSeatModel } from "~/models/dbSchema";
import {
  lockedSeatsTable,
  purchasedSeatsTable,
  purchaseTable,
} from "~/models/dbSchema";
import type { UnavailableSeat } from "~/models/seatMap";
import { nanoid } from "nanoid";

const contextWithDb = (
  cloudflareEnv: Record<string, unknown>,
): cloudflareEnv is { DB: D1Database } => {
  return "DB" in cloudflareEnv;
};

export const getDbFromContext = (
  cloudflareEnv: Record<string, unknown>,
): DrizzleD1Database => {
  if (!contextWithDb(cloudflareEnv)) {
    throw new Error("No database in context");
  }

  return drizzle(cloudflareEnv.DB);
};

export const getPurchasedSeatsForShow = async (
  db: DrizzleD1Database,
  showId: string,
): Promise<Pick<PurchasedSeatModel, "purchaseId" | "seatId">[]> =>
  await db
    .select({
      purchaseId: purchasedSeatsTable.purchaseId,
      seatId: purchasedSeatsTable.seatId,
    })
    .from(purchasedSeatsTable)
    .where(eq(purchasedSeatsTable.showId, showId))
    .all();

export const getLockedSeatsForShow = async (
  db: DrizzleD1Database,
  showId: string,
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
        gt(lockedSeatsTable.lockedUntil, new Date()),
      ),
    )
    .all();
};

export const getAllUnavailableSeatsForShow = async (
  db: DrizzleD1Database,
  showId: string,
): Promise<UnavailableSeat[]> => {
  const [lockedSeats, purchasedSeats] = await Promise.all([
    getLockedSeatsForShow(db, showId),
    getPurchasedSeatsForShow(db, showId),
  ]);

  return [
    ...lockedSeats.map((seat) => ({
      showId,
      seatId: seat.seatId,
      reason: "locked" as const,
    })),
    ...purchasedSeats.map(({ seatId }) => ({
      showId,
      seatId: seatId,
      reason: "purchased" as const,
    })),
  ];
};

export async function getLockedSeatsForSession(
  db: DrizzleD1Database,
  sessionId: string,
) {
  return await db
    .select()
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.sessionId, sessionId),
        gt(lockedSeatsTable.lockedUntil, new Date()),
      ),
    )
    .all();
}

export async function registerPurchase(
  db: DrizzleD1Database,
  stripeCheckoutSessionId: string,
  customerDetails: { name: string; email: string },
) {
  const seats = await db
    .select()
    .from(lockedSeatsTable)
    .where(
      eq(lockedSeatsTable.stripeCheckoutSessionId, stripeCheckoutSessionId),
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
      })),
    )
    .run();

  await db
    .delete(lockedSeatsTable)
    .where(
      eq(lockedSeatsTable.stripeCheckoutSessionId, stripeCheckoutSessionId),
    )
    .run();
}

export interface SeatIdWithStatus {
  seatId: string;
  status: "available" | "unavailable";
}

export const adminLockAndUnlockSeats = async (
  db: DrizzleD1Database,
  showId: string,
  selectedSeatsIdWithStatuses: SeatIdWithStatus[],
): Promise<{ success: boolean }> => {
  const [lockedSeats, purchasedSeats] = await Promise.all([
    getLockedSeatsForShow(db, showId),
    getPurchasedSeatsForShow(db, showId),
  ]);

  const selectedSeatsId = selectedSeatsIdWithStatuses.map(
    (selectedSeat) => selectedSeat.seatId,
  );
  const seatIdToStatusMap = new Map(
    selectedSeatsIdWithStatuses.map((selectedSeat) => [
      selectedSeat.seatId,
      selectedSeat.status,
    ]),
  );

  const lockedSeatsIdSet = new Set(lockedSeats.map((seat) => seat.seatId));
  const purchasedSeatsMap = new Map(
    purchasedSeats.map((seat) => [seat.seatId, seat]),
  );

  const lockedSeatsToUnlock = selectedSeatsId.filter((selectedSeatId) =>
    lockedSeatsIdSet.has(selectedSeatId),
  );
  const purchasedSeatsToUnlock = selectedSeatsId.filter((selectedSeatId) =>
    purchasedSeatsMap.has(selectedSeatId),
  );
  const seatsToMarkAsPurchased = selectedSeatsId.filter(
    (selectedSeatId) =>
      !lockedSeatsIdSet.has(selectedSeatId) &&
      !purchasedSeatsMap.has(selectedSeatId),
  );

  if (
    [...lockedSeatsToUnlock, ...purchasedSeatsToUnlock].some(
      (seatId) => seatIdToStatusMap.get(seatId) === "available",
    )
  ) {
    return { success: false };
  }

  if (
    seatsToMarkAsPurchased.some(
      (seatId) => seatIdToStatusMap.get(seatId) === "unavailable",
    )
  ) {
    return { success: false };
  }

  const adminPurchaseId = `ADMIN:${nanoid()}`;
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

  if (purchasedSeatsToUnlock.length > 0) {
    db.delete(purchaseTable)
      .where(
        inArray(
          purchaseTable.id,
          purchasedSeatsToUnlock.map(
            (seatId) => purchasedSeatsMap.get(seatId)?.purchaseId as string,
          ),
        ),
      )
      .run();
  }

  await Promise.all([
    lockedSeatsToUnlock.length > 0 &&
      db
        .delete(lockedSeatsTable)
        .where(
          and(
            eq(lockedSeatsTable.showId, showId),
            inArray(lockedSeatsTable.seatId, lockedSeatsToUnlock),
          ),
        )
        .run(),
    purchasedSeatsToUnlock.length > 0 &&
      db
        .delete(purchasedSeatsTable)
        .where(
          and(
            eq(purchasedSeatsTable.showId, showId),
            inArray(purchasedSeatsTable.seatId, purchasedSeatsToUnlock),
          ),
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
          })),
        )
        .run(),
  ]);

  return { success: true };
};

export const unlockSeat = async (
  db: DrizzleD1Database,
  showId: string,
  seatId: string,
) =>
  db
    .delete(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        eq(lockedSeatsTable.seatId, seatId),
      ),
    )
    .run();

export const setSeatLockHasChild = async (
  db: DrizzleD1Database,
  showId: string,
  seatId: string,
  hasChild: boolean,
) =>
  db
    .update(lockedSeatsTable)
    .set({ hasChildOnLap: hasChild ? 1 : 0 })
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        eq(lockedSeatsTable.seatId, seatId),
      ),
    )
    .run();
