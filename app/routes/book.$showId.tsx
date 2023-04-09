import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
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
    .where(eq(seatsLockTable.showId, showId))
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
  await db
    .insert(seatsLockTable)
    .values(
      seatIds.map((seatId) => ({
        showId,
        seatId: seatId as string,
        sessionId,
      }))
    )
    .run();

  return json({ success: true });
};

export default function Book() {
  const seats = useLoaderData<typeof loader>();
  console.log(seats);

  return (
    <div className="space-y-2">
      <h1 className="fluid-2xl">Billetterie Le Coin du jazz</h1>
      <p>Bienvenue à la billetterie du Coin du jazz.</p>
      <SeatMap seatIds={seats.map(({ seatId }) => seatId)} />
    </div>
  );
}
