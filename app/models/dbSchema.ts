import type { InferModel } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const seatsLockTable = sqliteTable(
  "seatsLock",
  {
    showId: text("show_id").notNull(),
    seatId: text("seat_id").notNull(),
    sessionId: text("session_id").notNull(),
    lockedUntil: integer("locked_until", { mode: "timestamp" }).notNull(),
  },
  (seatsLockTable) => ({
    compositePk: primaryKey(seatsLockTable.showId, seatsLockTable.seatId),
  })
);

export type SeatModel = InferModel<typeof seatsLockTable>;
