import { Form, Link } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/router";
import { redirect } from "@remix-run/router";
import { eq } from "drizzle-orm";
import { useMemo } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import Stripe from "stripe";

import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { LockedSeatModel } from "~/models/dbSchema";
import { lockedSeatsTable } from "~/models/dbSchema";
import { showByIdMap } from "~/models/shows";
import {
  getDbFromContext,
  getSeatLocksForSession,
} from "~/services/db.service.server";
import { getSession } from "~/session";
import { getSeatByIdMap, sectionTypeToTitle } from "~/utils/seatMap";

const YOUR_DOMAIN = "http://127.0.0.1:8788";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    return redirect("/");
  }
  const sessionId = session.get("sessionId");
  const db = getDbFromContext(context);

  const allSeatLocksForSession = await getSeatLocksForSession(db, sessionId);
  if (!allSeatLocksForSession.length) {
    return redirect("/");
  }

  // Lock seats for 45 minutes
  const lockedUntil = new Date(Date.now() + 45 * 60 * 1000);

  const stripe = new Stripe(context.STRIPE_PK as string, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(), // ensure we use a Fetch client, and not Node's `http`
  });

  const seatById = getSeatByIdMap(calaisTheatreAllSections);
  const stripeSession = await stripe.checkout.sessions.create({
    line_items: allSeatLocksForSession.map((seatLock) => {
      const show = showByIdMap.get(seatLock.showId);
      const seat = seatById.get(seatLock.seatId);
      if (!show || !seat) {
        throw new Error("Show or seat not found");
      }

      return {
        quantity: 1,
        price_data: {
          unit_amount: 1050,
          product_data: {
            name: `${show.title}: ${sectionTypeToTitle[seat.sectionType]}: ${
              seat.rowLetter
            } - ${seat.num}${seat.isBis ? "bis" : ""}`,
          },
          currency: "EUR",
        },
      };
    }),
    expires_at: Math.ceil(lockedUntil.getTime() / 1000),
    mode: "payment",
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
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
    allSeatLocksForSession: LockedSeatModel[];
  }>("root");
  if (!data) {
    throw new Error("No data");
  }

  const { allSeatLocksForSession } = data;
  const seatLocksPerShowId = allSeatLocksForSession.reduce((acc, seat) => {
    if (!acc[seat.showId]) {
      acc[seat.showId] = [];
    }
    acc[seat.showId].push(seat);
    return acc;
  }, {} as Record<string, LockedSeatModel[]>);

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

      {allSeatLocksForSession.length > 0 && (
        <Form method="post">
          <button type="submit" className="btn-primary btn">
            Valider le panier
          </button>
        </Form>
      )}
      {allSeatLocksForSession.length === 0 && (
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
