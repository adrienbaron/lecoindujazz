import type { LoaderFunctionArgs } from "@remix-run/router";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import type { SeatModel } from "~/models/dbSchema";
import { seatsLockTable } from "~/models/dbSchema";
import { showByIdMap } from "~/models/shows";
import { commitSession, getSession } from "~/session";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", uuidv4());
  }

  const sessionId = session.get("sessionId");

  const db = drizzle(context.DB as D1Database);
  const allSeatsInBasketForSession = await db
    .select()
    .from(seatsLockTable)
    .where(eq(seatsLockTable.sessionId, sessionId))
    .all();

  return typedjson(allSeatsInBasketForSession, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    },
  });
};

export default function Basket() {
  const allSeatsInBasketForSession = useTypedLoaderData<SeatModel[]>();

  const seatsPerShowId = allSeatsInBasketForSession.reduce((acc, seat) => {
    if (!acc[seat.showId]) {
      acc[seat.showId] = [];
    }
    acc[seat.showId].push(seat);
    return acc;
  }, {} as Record<string, SeatModel[]>);

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4">
      <h1 className="fluid-2xl">Panier</h1>
      <div className="flex flex-col gap-2">
        <p>Voici votre panier.</p>
        {Object.entries(seatsPerShowId).map(([showId, seats]) => {
          const show = showByIdMap.get(showId);
          if (!show) {
            throw new Error(`Show not found for id ${showId}`);
          }

          return (
            <div key={showId}>
              <h2>
                {show.title} - {show.date.toLocaleDateString("fr-FR")}
              </h2>
              <ul>
                {seats.map((seat) => (
                  <li key={seat.seatId}>{seat.seatId}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
