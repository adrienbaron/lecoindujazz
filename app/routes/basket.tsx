import type { ActionArgs } from "@remix-run/cloudflare";
import { Form, Link } from "@remix-run/react";
import { redirect } from "@remix-run/router";
import { eq } from "drizzle-orm";
import { useMemo } from "react";
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

export default function Basket() {
  const data = useTypedRouteLoaderData<{
    lockedSeatsForSession: LockedSeatModel[];
  }>("root");
  if (!data) {
    throw new Error("No data");
  }

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

      <hr className="border-separate" />

      <div className="flex justify-between">
        <span className="fluid-lg">Total</span>
        <strong className="fluid-lg">{formatPrice(totalPriceInCents)}</strong>
      </div>

      {lockedSeatsForSession.length > 0 && (
        <Form method="POST" className="flex justify-end">
          <button type="submit" className="btn-primary btn">
            Valider le panier
          </button>
        </Form>
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
