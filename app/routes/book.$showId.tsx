import type { ActionArgs, LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { and, eq, inArray } from "drizzle-orm";
import React from "react";
import { redirect } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import { SeatMap } from "~/components/seatMap";
import { lockedSeatsTable } from "~/models/dbSchema";
import { showByIdMap, showToHumanString } from "~/models/shows";
import {
  getAllUnavailableSeatsForShow,
  getDbFromContext,
} from "~/services/db.service.server";
import { commitSession, getSession } from "~/session";

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
      headers: {
        "Set-Cookie": await commitSession(session, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
      },
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
  const { showId } = useParams<{ showId: string }>();
  if (!showId) {
    throw new Error("Missing showId");
  }

  const show = showByIdMap.get(showId);
  if (!show) {
    throw new Error(`Show not found for id ${showId}`);
  }

  return (
    <Form
      className="grid w-full grid-rows-[80vh_0] lg:grid-cols-[auto_300px] lg:grid-rows-none"
      method="post"
    >
      <div className="flex flex-col gap-2 overflow-hidden p-2 md:p-4 lg:px-6">
        <h1 className="fluid-2xl">{showToHumanString(show)}</h1>
        <SeatMap unavailableSeats={allUnavailableSeats} />
      </div>
      <section className="fixed inset-x-0 bottom-0 flex justify-center bg-base-200 p-4 lg:relative lg:-mr-6">
        <button type="submit" className="btn-primary btn block">
          Ajouter au panier
        </button>
      </section>
    </Form>
  );
}
