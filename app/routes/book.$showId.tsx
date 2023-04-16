import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { and, eq, gt, inArray } from "drizzle-orm";
import { redirect } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import { SeatMap } from "~/components/seatMap";
import { lockedSeatsTable } from "~/models/dbSchema";
import { getDbFromContext } from "~/services/db.service.server";
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

  const db = getDbFromContext(context);
  const allLockedSeats = await db
    .select()
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        gt(lockedSeatsTable.lockedUntil, new Date())
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

  const db = getDbFromContext(context);
  const seatLocks = await db
    .select()
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        inArray(lockedSeatsTable.seatId, seatIds as string[])
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

  await Promise.all(
    seatLocks.map((seatLock) =>
      db
        .delete(lockedSeatsTable)
        .where(
          and(
            eq(lockedSeatsTable.showId, showId),
            eq(lockedSeatsTable.seatId, seatLock.seatId),
            eq(lockedSeatsTable.sessionId, seatLock.sessionId),
            eq(lockedSeatsTable.lockedUntil, seatLock.lockedUntil)
          )
        )
        .run()
    )
  );

  const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
  await db
    .insert(lockedSeatsTable)
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
