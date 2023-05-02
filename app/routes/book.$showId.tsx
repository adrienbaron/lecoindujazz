import type { ActionArgs, LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { and, eq, inArray } from "drizzle-orm";
import React, { useCallback } from "react";
import { redirect } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import { SeatMap } from "~/components/seatMap/seatMap";
import { lockedSeatsTable } from "~/models/dbSchema";
import type { Seat } from "~/models/seatMap";
import {
  PRICE_PER_SEAT_IN_CENTS,
  seatToHumanString,
  sectionTypeToTitle,
} from "~/models/seatMap";
import { showByIdMap, showToHumanString } from "~/models/shows";
import {
  getAllUnavailableSeatsForShow,
  getDbFromContext,
} from "~/services/db.service.server";
import { getSession, getSetCookieHeader } from "~/session";
import { formatPrice } from "~/utils/price";

export const loader = async ({
  context,
  request,
  params: { showId },
}: LoaderArgs) => {
  if (!showId) {
    throw json({ error: "Missing showId" }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", uuidv4());
  }

  const db = getDbFromContext(context);
  const allUnavailableSeats = await getAllUnavailableSeatsForShow(db, showId);

  return json(
    { allUnavailableSeats },
    {
      headers: await getSetCookieHeader(session),
    }
  );
};

export const action = async ({
  request,
  context,
  params: { showId },
}: ActionArgs) => {
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
  const { allUnavailableSeats } = useLoaderData<typeof loader>();
  const [selectedSeats, setSelectedSeats] = React.useState<Seat[]>([]);

  const { showId } = useParams<{ showId: string }>();
  if (!showId) {
    throw new Error("Missing showId");
  }
  const show = showByIdMap.get(showId);
  if (!show) {
    throw new Error(`Show not found for id ${showId}`);
  }

  const onSeatToggle = useCallback((seat: Seat, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSeats((selectedSeats) => [...selectedSeats, seat]);
    } else {
      setSelectedSeats((selectedSeats) =>
        selectedSeats.filter((s) => s.id !== seat.id)
      );
    }
  }, []);

  return (
    <Form
      className="grid w-full grid-rows-[80vh_0] lg:grid-cols-[auto_300px] lg:grid-rows-none"
      method="POST"
    >
      <div className="flex flex-col gap-2 overflow-hidden p-2 md:p-4 lg:px-6">
        <h1 className="fluid-2xl">{showToHumanString(show)}</h1>
        <SeatMap
          unavailableSeats={allUnavailableSeats}
          onSeatToggle={onSeatToggle}
        />
      </div>
      <section className="fixed inset-x-0 bottom-0 flex flex-col gap-4 bg-base-200 p-4 lg:relative">
        <ul className="flex w-full flex-col gap-2">
          {selectedSeats.map((seat) => (
            <li key={seat.id} className="flex justify-between">
              <span>
                {sectionTypeToTitle[seat.sectionType]} {seatToHumanString(seat)}
              </span>
              <span>{formatPrice(PRICE_PER_SEAT_IN_CENTS)}</span>
            </li>
          ))}
        </ul>
        <button
          type="submit"
          className="btn-primary btn block"
          disabled={selectedSeats.length === 0}
        >
          Ajouter au panier
        </button>
      </section>
    </Form>
  );
}
