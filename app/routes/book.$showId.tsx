import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { and, eq, gt, inArray, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { redirect } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import { SeatMap } from "~/components/seatMap";
import { seatsLockTable } from "~/models/dbSchema";
import { commitSession, getSession } from "~/session";

export const loader = async ({
  context,
  request,
  params: { showId },
}: LoaderFunctionArgs) => {
  if (!showId) {
    throw json({ error: "Missing showId" }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", uuidv4());
  }

  const db = drizzle(context.DB as D1Database);
  const allLockedSeats = await db
    .select()
    .from(seatsLockTable)
    .where(
      and(
        eq(seatsLockTable.showId, showId),
        gt(seatsLockTable.lockedUntil, new Date())
      )
    )
    .all();

  return json(allLockedSeats, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    },
  });
};

export const action = async ({
  request,
  context,
  params: { showId },
}: ActionFunctionArgs) => {
  if (!showId) {
    throw json({ error: "Missing showId" }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("sessionId");

  const formData = await request.formData();
  const seatIds = formData.getAll("seat");

  const db = drizzle(context.DB as D1Database);
  const seatLocks = await db
    .select()
    .from(seatsLockTable)
    .where(
      and(
        eq(seatsLockTable.showId, showId),
        inArray(seatsLockTable.seatId, seatIds as string[])
      )
    )
    .all();

  const hasLockedSeats = seatLocks.some(
    (seatLock) =>
      seatLock.sessionId !== sessionId && seatLock.lockedUntil > new Date()
  );
  if (hasLockedSeats) {
    throw json({ error: "Some seats are already locked" }, { status: 400 });
  }

  await db
    .delete(seatsLockTable)
    .where(
      or(
        ...seatLocks.map((seatLock) =>
          and(
            eq(seatsLockTable.showId, showId),
            eq(seatsLockTable.seatId, seatLock.seatId),
            eq(seatsLockTable.sessionId, seatLock.sessionId),
            eq(seatsLockTable.lockedUntil, seatLock.lockedUntil)
          )
        )
      )
    )
    .run();

  const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
  await db
    .insert(seatsLockTable)
    .values(
      seatIds.map((seatId) => ({
        showId,
        seatId: seatId as string,
        sessionId,
        lockedUntil,
      }))
    )
    .run();

  return redirect("/basket");
};

export default function Book() {
  const seats = useLoaderData<typeof loader>();
  return (
    <div className="space-y-2">
      <h1 className="fluid-2xl">Billetterie Le Coin du jazz</h1>
      <p>Bienvenue à la billetterie du Coin du jazz.</p>
      <SeatMap seatIds={seats.map(({ seatId }) => seatId)} />
    </div>
  );
}
