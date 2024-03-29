import type { InferModel } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const purchaseTable = sqliteTable("purchases", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const purchasedSeatsTable = sqliteTable(
  "purchased_seats",
  {
    showId: text("show_id").notNull(),
    seatId: text("seat_id").notNull(),
    purchaseId: text("purchase_id")
      .notNull()
      .references(() => purchaseTable.id),
  },
  (seatsLockTable) => ({
    compositePk: primaryKey(seatsLockTable.showId, seatsLockTable.seatId),
    purchaseIdIdx: index("purchaseIdIdx").on(seatsLockTable.purchaseId),
  })
);

export const lockedSeatsTable = sqliteTable(
  "locked_seats",
  {
    showId: text("show_id").notNull(),
    seatId: text("seat_id").notNull(),
    sessionId: text("locked_session_id").notNull(),
    lockedUntil: integer("locked_until", { mode: "timestamp" }).notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    hasChildOnLap: integer("has_child_on_lap"),
  },
  (seatsLockTable) => ({
    compositePk: primaryKey(seatsLockTable.showId, seatsLockTable.seatId),
    stripeCheckoutSessionIdIdx: index("stripeCheckoutSessionId").on(
      seatsLockTable.stripeCheckoutSessionId
    ),
  })
);

export type PurchaseModel = InferModel<typeof purchaseTable>;
export type PurchasedSeatModel = InferModel<typeof purchasedSeatsTable>;
export type LockedSeatModel = InferModel<typeof lockedSeatsTable>;
