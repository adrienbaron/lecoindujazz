import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import type { SeatModel } from "~/models/dbSchema";
import {
  getDbFromContext,
  getSeatLocksForSession,
} from "~/services/db.service.server";
import { commitSession, getSession } from "~/session";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Le Coin du jazz - Billetterie",
  viewport: "width=device-width,initial-scale=1",
  "theme-color": "#202021",
});

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", uuidv4());
  }

  const sessionId = session.get("sessionId");
  const db = getDbFromContext(context);
  const allSeatLocksForSession = await getSeatLocksForSession(db, sessionId);

  return typedjson(
    { allSeatLocksForSession },
    {
      headers: {
        "Set-Cookie": await commitSession(session, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
      },
    }
  );
};

export default function App() {
  const { allSeatLocksForSession } = useTypedLoaderData<{
    allSeatLocksForSession: SeatModel[];
  }>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header className="navbar bg-base-200">
          <div className="flex-1">
            <Link to={"/"}>
              <img src="/images/logo.png" alt="" height="36" width="150" />
            </Link>
          </div>
          <div className="flex-none">
            <Link to={"/basket"} className="btn-ghost btn">
              Panier ({allSeatLocksForSession.length})
            </Link>
          </div>
        </header>
        <main className="m-auto p-2 md:p-4 lg:px-6">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
