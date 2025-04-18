import { type ActionFunctionArgs, useRouteLoaderData } from "react-router";
import { data, redirect } from "react-router";
import { Form, Link, useNavigation, useRevalidator } from "react-router";
import classNames from "classnames";
import { eq } from "drizzle-orm";
import { useEffect, useMemo, useState } from "react";
import Stripe from "stripe";
import { z } from "zod";

import { BearIcon, TrashIcon, WarningIcon } from "~/components/icons";
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
  setSeatLockHasChild,
  unlockSeat,
} from "~/services/db.service.server";
import { getSessionStorage } from "~/session";
import { formatPrice } from "~/utils/price";
import type { loader } from "~/root";

const seatLockReferenceSchema = z.object({
  showId: z.string(),
  seatId: z.string(),
});

const childOnLapsPriceInCents = 6_00;

export const action = async ({ context, request }: ActionFunctionArgs) => {
  if (!context.cloudflare.env.IS_OPEN) {
    throw new Error("Booking is closed");
  }

  const { getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    return redirect("/");
  }
  const sessionId = session.get("sessionId");
  const db = getDbFromContext(context.cloudflare.env);

  const lockedSeatsForSession = await getLockedSeatsForSession(db, sessionId);
  if (!lockedSeatsForSession.length) {
    return redirect("/");
  }

  const formData = await request.formData();
  const deleteSeatData = formData.get("delete");
  if (deleteSeatData) {
    const seatToDelete = seatLockReferenceSchema.parse(
      JSON.parse(deleteSeatData as string),
    );
    await unlockSeat(db, seatToDelete.showId, seatToDelete.seatId);

    console.log(`[action][${sessionId}] removed seat: `, seatToDelete.seatId);
    return data({ success: true });
  }

  const addChildData = formData.get("add-child");
  if (addChildData) {
    const seatToAddChildTo = seatLockReferenceSchema.parse(
      JSON.parse(addChildData as string),
    );
    await setSeatLockHasChild(
      db,
      seatToAddChildTo.showId,
      seatToAddChildTo.seatId,
      true,
    );

    console.log(
      `[action][${sessionId}] added child to seat: `,
      seatToAddChildTo.seatId,
    );
    return data({ success: true });
  }

  const removeChildData = formData.get("remove-child");
  if (removeChildData) {
    const seatToRemoveChildFrom = seatLockReferenceSchema.parse(
      JSON.parse(removeChildData as string),
    );
    await setSeatLockHasChild(
      db,
      seatToRemoveChildFrom.showId,
      seatToRemoveChildFrom.seatId,
      false,
    );

    console.log(
      `[action][${sessionId}] removed child from seat: `,
      seatToRemoveChildFrom.seatId,
    );
    return data({ success: true });
  }

  // Lock seats for 45 minutes
  const lockedUntil = new Date(Date.now() + 45 * 60 * 1000);

  const stripe = new Stripe(context.cloudflare.env.STRIPE_PK as string, {
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
          unit_amount:
            getSeatPrice(seat) +
            (seatLock.hasChildOnLap ? childOnLapsPriceInCents : 0),
          product_data: {
            name: `${sectionTypeToTitle[seat.sectionType]} ${seatToHumanString(
              seat,
            )} ${
              seatLock.hasChildOnLap ? "(+ Enfant -4 ans)" : ""
            } | ${showToHumanString(show)}`,
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

  console.log(
    `[action][${sessionId}] confirmed basket: `,
    JSON.stringify(lockedSeatsForSession.map((s) => s.seatId)),
    "stripeSessionId: ",
    stripeSession.id,
  );
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
  const data = useRouteLoaderData<typeof loader>("root");
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

  const lockedSeatMap = new Map<string, LockedSeatModel>(
    lockedSeatsForSession.map((seatLock) => [seatLock.seatId, seatLock]),
  );

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

    return (
      acc +
      getSeatPrice(seat) +
      (seatLock.hasChildOnLap ? childOnLapsPriceInCents : 0)
    );
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
            <div key={showId} className="flex flex-col">
              <div className="flex flex-col gap-2">
                <h2 className="font-medium fluid-lg">
                  {showToHumanString(show)}
                </h2>
                <p className="flex items-center justify-start gap-2">
                  <div className="bg-success p-1 text-success-content">
                    <BearIcon className="size-4" />
                  </div>
                  <span>
                    Seul les enfants de -4 ans sur les genoux sont accepté
                  </span>
                </p>
              </div>
              <ul className="flex flex-col divide-y divide-base-300">
                {showSeats.map((seat) => {
                  const seatLockReference = JSON.stringify({
                    showId,
                    seatId: seat.id,
                  });
                  const isDeletingSeat =
                    navigation.state !== "idle" &&
                    navigation.formData?.get("delete") === seatLockReference;
                  const isAddingChild =
                    navigation.state !== "idle" &&
                    navigation.formData?.get("add-child") === seatLockReference;
                  const isRemovingChild =
                    navigation.state !== "idle" &&
                    navigation.formData?.get("remove-child") ===
                      seatLockReference;

                  const hasChildOnLap = lockedSeatMap.get(
                    seat.id,
                  )?.hasChildOnLap;

                  return (
                    <li key={seat.id} className="flex flex-col gap-2 py-4">
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                          <span>
                            {sectionTypeToTitle[seat.sectionType]}{" "}
                            {seatToHumanString(seat)}
                          </span>
                          <div className="flex flex-col gap-2 md:flex-row">
                            {!hasChildOnLap && (
                              <button
                                className={classNames(
                                  "btn-xs btn btn-success gap-1 self-start normal-case",
                                  isAddingChild && "loading",
                                )}
                                disabled={navigation.state !== "idle"}
                                name="add-child"
                                value={seatLockReference}
                              >
                                {!isAddingChild && (
                                  <BearIcon className="size-4" />
                                )}{" "}
                                Ajouter un Enfant (
                                {formatPrice(childOnLapsPriceInCents)})
                              </button>
                            )}
                            {!!hasChildOnLap && (
                              <button
                                className={classNames(
                                  "btn-xs btn btn-error gap-1 self-start normal-case",
                                  isRemovingChild && "loading",
                                )}
                                disabled={navigation.state !== "idle"}
                                name="remove-child"
                                value={seatLockReference}
                              >
                                {!isRemovingChild && (
                                  <BearIcon className="size-4" />
                                )}{" "}
                                Retirer l&rsquo;Enfant
                              </button>
                            )}
                            <button
                              className={classNames(
                                "btn-xs btn gap-1 self-start normal-case",
                                isDeletingSeat && "loading",
                              )}
                              disabled={navigation.state !== "idle"}
                              name="delete"
                              value={seatLockReference}
                            >
                              {!isDeletingSeat && (
                                <TrashIcon className="size-4" />
                              )}{" "}
                              Retirer du panier
                            </button>
                          </div>
                        </div>
                        <strong className="flex flex-col items-end">
                          <span>{formatPrice(getSeatPrice(seat))}</span>
                          {!!hasChildOnLap && (
                            <span className="flex text-xs text-warning">
                              +<BearIcon className="size-4" />{" "}
                              {formatPrice(childOnLapsPriceInCents)}
                            </span>
                          )}
                        </strong>
                      </div>
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
                isValidatingBasket && "loading",
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
          <Link to={"/"} className="btn btn-primary self-center">
            Retour à l&apos;accueil
          </Link>
        </div>
      )}
    </div>
  );
}
