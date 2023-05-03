import type { ActionArgs, LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  Form,
  useLoaderData,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import classNames from "classnames";
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
  adminLockAndUnlockSeats,
  getAllUnavailableSeatsForShow,
  getDbFromContext,
  getPurchasedSeatsForShow,
} from "~/services/db.service.server";
import { getSessionStorage, getSetCookieHeader } from "~/session";
import { formatPrice } from "~/utils/price";

export const loader = async ({
  context,
  request,
  params: { showId },
}: LoaderArgs) => {
  if (!showId) {
    throw json({ error: "Missing showId" }, { status: 400 });
  }

  const { getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", uuidv4());
  }

  const db = getDbFromContext(context);
  const allUnavailableSeats = await getAllUnavailableSeatsForShow(db, showId);

  return json(
    { allUnavailableSeats },
    {
      headers: await getSetCookieHeader(context, session),
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

  const { getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("sessionId");

  const formData = await request.formData();
  const selectedSeatsId = formData.getAll("seat") as string[];

  const db = getDbFromContext(context);

  const isAdmin = session.get("isAdmin");
  if (isAdmin) {
    await adminLockAndUnlockSeats(db, showId, selectedSeatsId);
    return json({ success: true });
  }

  const seatLocks = await db
    .select()
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        inArray(lockedSeatsTable.seatId, selectedSeatsId)
      )
    )
    .all();
  const purchasedSeats = await getPurchasedSeatsForShow(db, showId);
  const hasLockedSeats =
    seatLocks.some(
      (seatLock) =>
        seatLock.sessionId !== sessionId && seatLock.lockedUntil > new Date()
    ) || purchasedSeats.some((seat) => selectedSeatsId.includes(seat.seatId));
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

  const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  await db
    .insert(lockedSeatsTable)
    .values(
      selectedSeatsId.map((seatId) => ({
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
  const { isAdmin } = useRouteLoaderData("root") as { isAdmin: boolean };
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

  const unavailableSeatsMap = new Map(
    allUnavailableSeats.map((seat) => [seat.seatId, seat])
  );

  const navigation = useNavigation();
  return (
    <Form
      className="grid w-full grid-rows-[80vh_0] lg:grid-cols-[auto_300px] lg:grid-rows-none"
      method="POST"
    >
      <div className="flex flex-col gap-2 overflow-hidden p-2 md:p-4 lg:px-6">
        <h1 className="fluid-2xl">{showToHumanString(show)}</h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1 text-sm">
            <div className="h-4 w-4 bg-green-700" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="h-4 w-4 border-4 border-orange-300 bg-green-700" />
            <span>Visibilitée réduite</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="h-4 w-4 bg-blue-300" />
            <span>PMR</span>
          </div>
        </div>
        <SeatMap
          unavailableSeats={allUnavailableSeats}
          onSeatToggle={onSeatToggle}
          allowSelectUnavailableSeats={isAdmin}
        />
      </div>
      <section className="fixed inset-x-0 bottom-0 flex flex-col gap-4 bg-base-200 p-4 lg:relative">
        {selectedSeats.length > 0 && (
          <ul className="flex w-full flex-col gap-2">
            {selectedSeats.map((seat) => {
              const unavailableSeatForSelectedSeat = unavailableSeatsMap.get(
                seat.id
              );

              return (
                <li
                  key={seat.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {sectionTypeToTitle[seat.sectionType]}{" "}
                      {seatToHumanString(seat)}
                    </span>
                    {isAdmin && unavailableSeatForSelectedSeat && (
                      <span className="text-xs text-gray-400">
                        {unavailableSeatForSelectedSeat.reason === "locked" &&
                          "Dans un panier"}
                        {unavailableSeatForSelectedSeat.reason ===
                          "purchased" && "Vendu"}
                      </span>
                    )}
                  </div>
                  {!isAdmin && (
                    <span>{formatPrice(PRICE_PER_SEAT_IN_CENTS)}</span>
                  )}
                  {isAdmin &&
                    (unavailableSeatForSelectedSeat ? (
                      <span className="text-success">Débloquer</span>
                    ) : (
                      <span className="text-error">Bloquer</span>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="submit"
          className={classNames(
            "btn-primary btn",
            navigation.state !== "idle" && "loading"
          )}
          disabled={selectedSeats.length === 0 || navigation.state !== "idle"}
        >
          {isAdmin ? "Valider" : "Ajouter au panier"}
        </button>
      </section>
    </Form>
  );
}
