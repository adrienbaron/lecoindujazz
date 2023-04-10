import { Form } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { redirect } from "@remix-run/router";
import { and, eq, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { useMemo } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { SeatModel } from "~/models/dbSchema";
import { seatsLockTable } from "~/models/dbSchema";
import { showByIdMap } from "~/models/shows";
import { getSession } from "~/session";
import { getSeatByIdMap, sectionTypeToTitle } from "~/utils/seatMap";

async function getSeatLocksForSession(
  db: BaseSQLiteDatabase<"async", D1Result>,
  sessionId: string
) {
  return await db
    .select()
    .from(seatsLockTable)
    .where(
      and(
        eq(seatsLockTable.sessionId, sessionId),
        gt(seatsLockTable.lockedUntil, new Date())
      )
    )
    .all();
}

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    return redirect("/");
  }

  const sessionId = session.get("sessionId");
  const db = drizzle(context.DB as D1Database);
  const allSeatLocksForSession = await getSeatLocksForSession(db, sessionId);

  return typedjson(allSeatLocksForSession);
};

export default function Basket() {
  const allSeatLocksForSession = useTypedLoaderData<SeatModel[]>();

  const seatLocksPerShowId = allSeatLocksForSession.reduce((acc, seat) => {
    if (!acc[seat.showId]) {
      acc[seat.showId] = [];
    }
    acc[seat.showId].push(seat);
    return acc;
  }, {} as Record<string, SeatModel[]>);

  const seatById = useMemo(() => getSeatByIdMap(calaisTheatreAllSections), []);
  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4">
      <h1 className="fluid-2xl">Panier</h1>
      <div className="flex flex-col gap-2">
        {Object.entries(seatLocksPerShowId).map(([showId, seatLocks]) => {
          const show = showByIdMap.get(showId);
          if (!show) {
            throw new Error(`Show not found for id ${showId}`);
          }

          return (
            <div key={showId} className="flex flex-col gap-2">
              <h2 className="font-medium fluid-lg">
                {show.title} - {show.date.toLocaleDateString("fr-FR")}
              </h2>
              <ul className="flex flex-col gap-2">
                {seatLocks.map((seatLock) => {
                  const seat = seatById.get(seatLock.seatId);
                  if (!seat) {
                    throw new Error(`Seat not found for id ${seatLock.seatId}`);
                  }

                  return (
                    <li key={seatLock.seatId}>
                      <span className="font-medium">
                        {sectionTypeToTitle[seat.sectionType]}
                      </span>
                      : {seat.rowLetter} - {seat.num}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <Form method="post">
        <button type="submit" className="btn-primary btn">
          Valider le panier
        </button>
      </Form>
    </div>
  );
}
