import type { ActionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useNavigation, useRevalidator } from "@remix-run/react";
import { redirect } from "@remix-run/router";
import classNames from "classnames";
import { eq } from "drizzle-orm";
import { useEffect, useMemo, useState } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import Stripe from "stripe";
import { z } from "zod";

import { TrashIcon, WarningIcon } from "~/components/icons";
import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { LockedSeatModel } from "~/models/dbSchema";
import { lockedSeatsTable } from "~/models/dbSchema";
import type { Seat } from "~/models/seatMap";
import {
  getSeatByIdMap,
  getSeatPrice,
  seatSectionsOrder,
  seatToHumanString,
  sectionTypeToTitle,
} from "~/models/seatMap";
import { showByIdMap, showToHumanString } from "~/models/shows";
import {
  getDbFromContext,
  getLockedSeatsForSession,
  unlockSeat,
} from "~/services/db.service.server";
import { getSessionStorage } from "~/session";
import { formatPrice } from "~/utils/price";

const deleteSeatDataSchema = z.object({
  showId: z.string(),
  seatId: z.string(),
});

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

  const formData = await request.formData();
  const deleteSeatData = formData.get("delete");
  if (deleteSeatData) {
    const seatToDelete = deleteSeatDataSchema.parse(
      JSON.parse(deleteSeatData as string)
    );
    const hasSeatToDeleteInSession = lockedSeatsForSession.some(
      (seatLock) =>
        seatLock.showId === seatToDelete.showId &&
        seatLock.seatId === seatToDelete.seatId
    );
    if (!hasSeatToDeleteInSession) {
      throw new Error("Seat not found in session");
    }

    await unlockSeat(db, seatToDelete.showId, seatToDelete.seatId);
    return json({ success: true });
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
          unit_amount: getSeatPrice(seat),
          product_data: {
            name: `${sectionTypeToTitle[seat.sectionType]} ${seatToHumanString(
              seat
            )}`,
            description: `${showToHumanString(show)}`,
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
  const seatsPerShow = lockedSeatsForSession.reduce((acc, seatLock) => {
    const seat = seatById.get(seatLock.seatId);
    if (!seat) {
      throw new Error(`Seat not found for id ${seatLock.seatId}`);
    }

    const showSections = acc.get(seatLock.showId) ?? [];
    showSections.push(seat);
    acc.set(seatLock.showId, showSections);
    return acc;
  }, new Map<string, Seat[]>());

  [...seatsPerShow.values()].forEach((seats) => {
    seats.sort((a, b) => {
      const sectionOrder =
        seatSectionsOrder.indexOf(a.sectionType) -
        seatSectionsOrder.indexOf(b.sectionType);
      if (sectionOrder !== 0) {
        return sectionOrder;
      }

      return a.id.localeCompare(b.id);
    });
  });

  const totalPriceInCents = lockedSeatsForSession.reduce((acc, seatLock) => {
    const seat = seatById.get(seatLock.seatId);
    if (!seat) {
      throw new Error(`Seat not found for id ${seatLock.seatId}`);
    }

    return acc + getSeatPrice(seat);
  }, 0);

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

  const navigation = useNavigation();

  const isValidatingBasket =
    navigation.state !== "idle" &&
    navigation.formData?.get("action") === "startCheckout";

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4 p-2 md:p-4 lg:px-6">
      <h1 className="fluid-2xl">Panier</h1>
      <Form className="flex flex-col gap-2" method="DELETE">
        {[...seatsPerShow.entries()].map(([showId, showSeats]) => {
          const show = showByIdMap.get(showId);
          if (!show) {
            throw new Error(`Show not found for id ${showId}`);
          }

          return (
            <div key={showId} className="flex flex-col gap-2">
              <h2 className="font-medium fluid-lg">
                {showToHumanString(show)}
              </h2>
              <ul className="flex flex-col divide-y divide-base-300">
                {showSeats.map((seat) => {
                  const deleteValue = JSON.stringify({
                    showId,
                    seatId: seat.id,
                  });
                  const isDeletingSeat =
                    navigation.state !== "idle" &&
                    navigation.formData?.get("delete") === deleteValue;

                  return (
                    <li key={seat.id} className="flex flex-col gap-2 py-4">
                      <div className="flex justify-between">
                        <span>
                          {sectionTypeToTitle[seat.sectionType]}{" "}
                          {seatToHumanString(seat)}
                        </span>
                        <strong>{formatPrice(getSeatPrice(seat))}</strong>
                      </div>
                      <button
                        className={classNames(
                          "btn-xs btn gap-1 self-start normal-case",
                          isDeletingSeat && "loading"
                        )}
                        disabled={navigation.state !== "idle"}
                        name="delete"
                        value={deleteValue}
                      >
                        {!isDeletingSeat && <TrashIcon className="h-4 w-4" />}{" "}
                        Retirer du panier
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Form>

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
              <WarningIcon />
              <span>
                Votre panier expire dans{" "}
                <strong>
                  {expiresMinutes > 0 && <>{expiresMinutes} minutes et</>}{" "}
                  {expiresSeconds} secondes
                </strong>
              </span>
            </div>
          </div>
          <Form method="POST" className="flex justify-end">
            <button
              type="submit"
              className={classNames(
                "btn-primary btn",
                isValidatingBasket && "loading"
              )}
              name="action"
              value="startCheckout"
              disabled={navigation.state !== "idle"}
            >
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
