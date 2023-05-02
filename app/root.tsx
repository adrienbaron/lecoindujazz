import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import classNames from "classnames";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import type { LockedSeatModel } from "~/models/dbSchema";
import {
  getDbFromContext,
  getLockedSeatsForSession,
} from "~/services/db.service.server";
import { getSession, getSetCookieHeader } from "~/session";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Le Coin du jazz - Billetterie",
  viewport: "width=device-width,initial-scale=1",
  "theme-color": "#202021",
});

export const loader = async ({ context, request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", uuidv4());
  }

  const sessionId = session.get("sessionId");
  const db = getDbFromContext(context);
  const lockedSeatsForSession = await getLockedSeatsForSession(db, sessionId);

  return typedjson(
    {
      lockedSeatsForSession,
      isAdmin: session.get("isAdmin"),
      isBookingOpen: context.IS_OPEN === "true",
    },
    {
      headers: await getSetCookieHeader(session),
    }
  );
};

export default function App() {
  const { lockedSeatsForSession, isAdmin } = useTypedLoaderData<{
    lockedSeatsForSession: LockedSeatModel[];
    isAdmin: boolean;
  }>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen">
          <header
            className={classNames(
              "navbar transition-colors",
              isAdmin ? "bg-red-950" : "bg-base-200"
            )}
          >
            <div className="flex-1">
              <Link to={"/"}>
                <img src="/images/logo.png" alt="" height="36" width="150" />
              </Link>
            </div>
            <div className="flex-none">
              {!isAdmin && (
                <Link to={"/basket"} className="btn-ghost btn">
                  Panier ({lockedSeatsForSession.length})
                </Link>
              )}
              {isAdmin && (
                <Link to={"/admin"} className="badge-error badge">
                  Administrateur
                </Link>
              )}
            </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
        <footer className="footer flex justify-end bg-base-200 p-8">
          <Link to="/admin" className="link">
            Administrateur
          </Link>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
