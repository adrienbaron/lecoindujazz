import type { ActionArgs } from "@remix-run/cloudflare";
import { Form, Link, useRevalidator } from "@remix-run/react";
import { redirect } from "@remix-run/router";
import { eq } from "drizzle-orm";
import { useEffect, useMemo, useState } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import Stripe from "stripe";

import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { LockedSeatModel } from "~/models/dbSchema";
import { lockedSeatsTable } from "~/models/dbSchema";
import type { Seat, SeatSectionType } from "~/models/seatMap";
import {
  getSeatByIdMap,
  PRICE_PER_SEAT_IN_CENTS,
  seatToHumanString,
  sectionTypeToTitle,
} from "~/models/seatMap";
import { showByIdMap, showToHumanString } from "~/models/shows";
import {
  getDbFromContext,
  getLockedSeatsForSession,
} from "~/services/db.service.server";
import { getSessionStorage } from "~/session";
import { formatPrice } from "~/utils/price";

export const action = async ({ context, request }: ActionArgs) => {
  if (!context.IS_OPEN) {
    throw new Error("Booking is closed");
  }

  const { getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    return redirect("/");
  }
  const sessionId = session.get("sessionId");
  const db = getDbFromContext(context);

  const lockedSeatsForSession = await getLockedSeatsForSession(db, sessionId);
  if (!lockedSeatsForSession.length) {
    return redirect("/");
  }

  // Lock seats for 45 minutes
  const lockedUntil = new Date(Date.now() + 45 * 60 * 1000);

  const stripe = new Stripe(context.STRIPE_PK as string, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(), // ensure we use a Fetch client, and not Node's `http`
  });

  const url = new URL(request.url);

  const seatById = getSeatByIdMap(calaisTheatreAllSections);
  const stripeSession = await stripe.checkout.sessions.create({
    line_items: lockedSeatsForSession.map((seatLock) => {
      const show = showByIdMap.get(seatLock.showId);
      const seat = seatById.get(seatLock.seatId);
      if (!show || !seat) {
        throw new Error("Show or seat not found");
      }

      return {
        quantity: 1,
        price_data: {
          unit_amount: PRICE_PER_SEAT_IN_CENTS,
          product_data: {
            name: `${showToHumanString(show)} | ${
              sectionTypeToTitle[seat.sectionType]
            }: ${seatToHumanString(seat)}`,
          },
          currency: "EUR",
        },
      };
    }),
    expires_at: Math.ceil(lockedUntil.getTime() / 1000),
    mode: "payment",
    success_url: `${url.protocol}//${url.host}?success=true`,
    cancel_url: `${url.protocol}//${url.host}/basket?canceled=true`,
  });

  if (!stripeSession.url) {
    throw new Error("Stripe session URL is missing");
  }

  await db
    .update(lockedSeatsTable)
    .set({ lockedUntil, stripeCheckoutSessionId: stripeSession.id })
    .where(eq(lockedSeatsTable.sessionId, sessionId))
    .run();

  return redirect(stripeSession.url);
};

function sessionToExpireInSeconds(lockedSeatsForSession: LockedSeatModel[]) {
  if (!lockedSeatsForSession.length) {
    return 0;
  }

  const now = new Date();
  const expiresAt = new Date(lockedSeatsForSession[0].lockedUntil);
  const diff = expiresAt.getTime() - now.getTime();
  return Math.max(Math.ceil(diff / 1000), 0);
}

export default function Basket() {
  const data = useTypedRouteLoaderData<{
    lockedSeatsForSession: LockedSeatModel[];
  }>("root");
  if (!data) {
    throw new Error("No data");
  }

  const revalidator = useRevalidator();

  const seatById = useMemo(() => getSeatByIdMap(calaisTheatreAllSections), []);

  const { lockedSeatsForSession } = data;
  const seatsPerShowAndSection = lockedSeatsForSession.reduce(
    (acc, seatLock) => {
      const seat = seatById.get(seatLock.seatId);
      if (!seat) {
        throw new Error(`Seat not found for id ${seatLock.seatId}`);
      }

      const showSections =
        acc.get(seatLock.showId) ?? new Map<SeatSectionType, Seat[]>();
      const sectionSeats = showSections.get(seat.sectionType) ?? [];
      showSections.set(seat.sectionType, [...sectionSeats, seat]);
      acc.set(seatLock.showId, showSections);
      return acc;
    },
    new Map<string, Map<SeatSectionType, Seat[]>>()
  );

  const totalPriceInCents =
    PRICE_PER_SEAT_IN_CENTS * lockedSeatsForSession.length;

  const [expiresInSeconds, setExpiresInSeconds] = useState(() => {
    return sessionToExpireInSeconds(lockedSeatsForSession);
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeftInSeconds = sessionToExpireInSeconds(lockedSeatsForSession);
      setExpiresInSeconds(timeLeftInSeconds);

      if (timeLeftInSeconds <= 0) {
        revalidator.revalidate();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedSeatsForSession, revalidator]);

  const expiresMinutes = Math.floor(expiresInSeconds / 60);
  const expiresSeconds = expiresInSeconds % 60;

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4 p-2 md:p-4 lg:px-6">
      <h1 className="fluid-2xl">Panier</h1>
      <div className="flex flex-col gap-2">
        {[...seatsPerShowAndSection.entries()].map(([showId, sections]) => {
          const show = showByIdMap.get(showId);
          if (!show) {
            throw new Error(`Show not found for id ${showId}`);
          }

          return (
            <div key={showId} className="flex flex-col gap-2">
              <h2 className="font-medium fluid-lg">
                {showToHumanString(show)}
              </h2>
              <ul className="flex flex-col gap-2">
                {[...sections.entries()].map(([sectionType, seat]) => (
                  <li key={sectionType} className="flex flex-col gap-1">
                    <ul>
                      {seat.map((seat) => (
                        <li key={sectionType} className="flex justify-between">
                          <span>
                            {sectionTypeToTitle[sectionType]}{" "}
                            {seatToHumanString(seat)}
                          </span>
                          <strong>
                            {formatPrice(PRICE_PER_SEAT_IN_CENTS)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {lockedSeatsForSession.length > 0 && (
        <>
          <hr className="border-separate" />

          <div className="flex justify-between">
            <span className="fluid-lg">Total</span>
            <strong className="fluid-lg">
              {formatPrice(totalPriceInCents)}
            </strong>
          </div>
          <div className="alert alert-info">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Votre panier expire dans{" "}
                <strong>
                  {expiresMinutes} minutes et {expiresSeconds} secondes
                </strong>
              </span>
            </div>
          </div>
          <Form method="POST" className="flex justify-end">
            <button type="submit" className="btn-primary btn">
              Valider le panier
            </button>
          </Form>
        </>
      )}
      {lockedSeatsForSession.length === 0 && (
        <div className="flex flex-col gap-4 text-center">
          <p className="fluid-lg">Votre panier est vide</p>
          <Link to={"/"} className="btn-primary btn self-center">
            Retour à l&apos;accueil
          </Link>
        </div>
      )}
    </div>
  );
}
