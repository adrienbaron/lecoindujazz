import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { data } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
  useRevalidator,
  useRouteLoaderData,
} from "react-router";
import classNames from "classnames";
import { and, eq, inArray } from "drizzle-orm";
import React, { useCallback, useEffect } from "react";

import { WarningIcon } from "~/components/icons";
import { SeatMap } from "~/components/seatMap/seatMap";
import { lockedSeatsTable } from "~/models/dbSchema";
import type { Seat } from "~/models/seatMap";
import {
  getSeatPrice,
  seatToHumanString,
  sectionTypeToTitle,
} from "~/models/seatMap";
import { showByIdMap, showToHumanString } from "~/models/shows";
import type { SeatIdWithStatus } from "~/services/db.service.server";
import {
  adminLockAndUnlockSeats,
  getAllUnavailableSeatsForShow,
  getDbFromContext,
  getPurchasedSeatsForShow,
} from "~/services/db.service.server";
import { getSessionStorage, getSetCookieHeader } from "~/session";
import { formatPrice } from "~/utils/price";
import { useOnFocus } from "~/utils/useOnFocus";
import { nanoid } from "nanoid";

export const loader = async ({
  context,
  request,
  params: { showId },
}: LoaderFunctionArgs) => {
  if (!showId) {
    throw data({ error: "Missing showId" }, { status: 400 });
  }

  const { getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", nanoid());
  }

  const db = getDbFromContext(context.cloudflare.env);
  const allUnavailableSeats = await getAllUnavailableSeatsForShow(db, showId);

  return data(
    { allUnavailableSeats },
    { headers: await getSetCookieHeader(context, session) },
  );
};

export const action = async ({
  request,
  context,
  params: { showId },
}: ActionFunctionArgs) => {
  if (!showId) {
    throw data({ error: "Missing showId" }, { status: 400 });
  }

  const { getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("sessionId");

  const formData = await request.formData();
  const seatIdsWithStatusStrings = formData.getAll("seat") as string[];
  const selectedSeatIdsWithStatus = seatIdsWithStatusStrings.map(
    (seatIdWithStatus): SeatIdWithStatus => {
      const [status, seatId] = seatIdWithStatus.split(":");
      return { seatId, status: status as SeatIdWithStatus["status"] };
    },
  );
  const selectedSeatsId = selectedSeatIdsWithStatus.map((s) => s.seatId);

  const db = getDbFromContext(context.cloudflare.env);

  const isAdmin = session.get("isAdmin");
  if (isAdmin) {
    const { success } = await adminLockAndUnlockSeats(
      db,
      showId,
      selectedSeatIdsWithStatus,
    );

    if (!success) {
      return data(
        { success: false, reason: "STATE_CHANGED", dateTime: Date.now() },
        { status: 400 },
      );
    }

    return data({ success: true, dateTime: Date.now() });
  }

  const seatLocks = await db
    .select()
    .from(lockedSeatsTable)
    .where(
      and(
        eq(lockedSeatsTable.showId, showId),
        inArray(lockedSeatsTable.seatId, selectedSeatsId),
      ),
    )
    .all();
  const purchasedSeats = await getPurchasedSeatsForShow(db, showId);
  const hasLockedSeats =
    seatLocks.some(
      (seatLock) =>
        seatLock.sessionId !== sessionId && seatLock.lockedUntil > new Date(),
    ) || purchasedSeats.some((seat) => selectedSeatsId.includes(seat.seatId));
  if (hasLockedSeats) {
    return data(
      { success: false, reason: "UNAVAILABLE_SEATS" },
      { status: 400 },
    );
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
            eq(lockedSeatsTable.lockedUntil, seatLock.lockedUntil),
          ),
        )
        .run(),
    ),
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
      })),
    )
    .run();

  console.log(
    `[action][${sessionId}] locked seats: `,
    JSON.stringify(selectedSeatsId),
  );
  return redirect("/basket");
};

export default function Book() {
  const { allUnavailableSeats } = useLoaderData<typeof loader>();
  const { isAdmin } = useRouteLoaderData("root") as { isAdmin: boolean };
  const [selectedSeats, setSelectedSeats] = React.useState<Seat[]>([]);

  const formKeyRef = React.useRef(Date.now());
  const infoMessageRef = React.useRef<string | null>(null);

  const { showId } = useParams<{ showId: string }>();
  if (!showId) {
    throw new Error("Missing showId");
  }
  const show = showByIdMap.get(showId);
  if (!show) {
    throw new Error(`Show not found for id ${showId}`);
  }

  const selectedSeatsSet = new Set(selectedSeats.map((seat) => seat.id));
  if (
    !isAdmin &&
    allUnavailableSeats
      .filter((seat) => seat.showId === showId)
      .some((seat) => selectedSeatsSet.has(seat.seatId))
  ) {
    formKeyRef.current = Date.now();
    infoMessageRef.current =
      "Certains sieges ont été reservés par un autre utilisateur, votre séléction a été réinitialisée";
    setTimeout(() => {
      setSelectedSeats([]);
    }, 0);
  }

  const { success, reason, dateTime } =
    useActionData<{ success: boolean; reason: string; dateTime: number }>() ??
    {};

  const lastUpdatedDateTimeRef = React.useRef(dateTime);
  if (isAdmin && lastUpdatedDateTimeRef.current !== dateTime) {
    lastUpdatedDateTimeRef.current = dateTime;
    formKeyRef.current = Date.now();
    setTimeout(() => {
      setSelectedSeats([]);
    }, 0);

    if (success === false && reason === "STATE_CHANGED") {
      infoMessageRef.current =
        "Certains sieges ont été reservés par un autre utilisateur, votre séléction a été réinitialisée";
    }
  }

  const onSeatToggle = useCallback((seat: Seat, isSelected: boolean) => {
    infoMessageRef.current = null;

    if (isSelected) {
      setSelectedSeats((selectedSeats) => [...selectedSeats, seat]);
    } else {
      setSelectedSeats((selectedSeats) =>
        selectedSeats.filter((s) => s.id !== seat.id),
      );
    }
  }, []);

  const unavailableSeatsMap = new Map(
    allUnavailableSeats.map((seat) => [seat.seatId, seat]),
  );

  const { revalidate } = useRevalidator();
  useOnFocus(revalidate);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const interval = setInterval(revalidate, 5_000);
    return () => clearInterval(interval);
  }, [isAdmin, revalidate]);

  useEffect(
    function revalidateOnReconnect() {
      function onReconnect() {
        revalidate();
      }
      window.addEventListener("online", onReconnect);
      return () => window.removeEventListener("online", onReconnect);
    },
    [revalidate],
  );

  const navigation = useNavigation();
  return (
    <Form
      className="grid w-full grid-rows-[85vh_0] lg:grid-cols-[auto_300px] lg:grid-rows-none"
      method="POST"
    >
      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="px-4 py-2">
          <h1 className="fluid-2xl">{showToHumanString(show)}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1 text-sm">
              <div className="size-4 bg-green-700" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="size-4 border-4 border-orange-300 bg-green-700" />
              <span>Visibilitée réduite</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="size-4 bg-blue-300" />
              <span>PMR</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="bg-green-700 px-1 text-xs font-medium">bis</div>
              <span>Strapontin</span>
            </div>
          </div>
        </div>
        <SeatMap
          unavailableSeats={allUnavailableSeats}
          onSeatToggle={onSeatToggle}
          allowSelectUnavailableSeats={isAdmin}
          keyRef={formKeyRef}
        />
      </div>
      <section className="fixed inset-x-0 bottom-0 flex flex-col gap-4 bg-base-200 p-4 lg:relative">
        {selectedSeats.length > 0 && (
          <ul className="flex w-full flex-col gap-2">
            {selectedSeats.map((seat) => {
              const unavailableSeatForSelectedSeat = unavailableSeatsMap.get(
                seat.id,
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
                  {!isAdmin && <span>{formatPrice(getSeatPrice(seat))}</span>}
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
        {infoMessageRef.current && (
          <div className="alert alert-info px-2 py-1 text-sm">
            <div>
              <WarningIcon />
              <span>{infoMessageRef.current}</span>
            </div>
          </div>
        )}
        <button
          type="submit"
          className={classNames(
            "btn-primary btn",
            navigation.state !== "idle" && "loading",
          )}
          disabled={selectedSeats.length === 0 || navigation.state !== "idle"}
        >
          {isAdmin ? "Valider" : "Ajouter au panier"}
        </button>
      </section>
    </Form>
  );
}
