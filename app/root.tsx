import styles from "./tailwind.css?url";

import { type LoaderFunctionArgs, data, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import classNames from "classnames";
import React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import type { LockedSeatModel } from "./models/dbSchema";
import {
  getDbFromContext,
  getLockedSeatsForSession,
} from "./services/db.service.server";
import { getSessionStorage, getSetCookieHeader } from "./session";
import { nanoid } from "nanoid";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: "Le Coin Du Jazz" },
    data?.isProduction ? {} : { property: "robots", content: "noindex" },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#202021" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { getSession } = getSessionStorage(context);

  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("sessionId")) {
    session.set("sessionId", nanoid());
  }

  const sessionId = session.get("sessionId");
  const db = getDbFromContext(context.cloudflare.env);
  const lockedSeatsForSession = await getLockedSeatsForSession(db, sessionId);

  return data(
    {
      lockedSeatsForSession,
      isAdmin: session.get("isAdmin"),
      isBookingOpen: context.cloudflare.env.IS_OPEN === "true",
      isProduction: context.cloudflare.env.IS_PRODUCTION === "true",
    },
    {
      headers: await getSetCookieHeader(context, session),
    },
  );
};

export default function App() {
  const { lockedSeatsForSession, isAdmin, isProduction } = useLoaderData<{
    lockedSeatsForSession: LockedSeatModel[];
    isAdmin: boolean;
    isProduction: boolean;
  }>();

  return (
    <div>
      <div className="min-h-screen">
        <header
          className={classNames(
            "navbar transition-colors",
            isAdmin ? "bg-red-950" : "bg-base-200",
          )}
        >
          <div className="flex-1">
            <Link to={"/"}>
              <img src="/images/logo.png" alt="" height="36" width="150" />
            </Link>
          </div>
          <div className="flex-none">
            {!isAdmin && (
              <Link to={"/basket"} className="btn btn-ghost">
                Panier ({lockedSeatsForSession.length})
              </Link>
            )}
            {isAdmin && (
              <Link to={"/admin"} className="badge badge-error">
                Administrateur
              </Link>
            )}
          </div>
        </header>
        {!isProduction && (
          <div className="bg-red-600 p-4 text-center">
            Site de test! Aucune réservation n&apos;est réelle. Pour le vrai
            site,{" "}
            <a href="https://billetteries.lecoindujazz.com/" className="link">
              cliquez ici
            </a>
          </div>
        )}
        <main>
          <Outlet />
        </main>
      </div>
      <footer className="footer flex justify-end bg-base-200 p-8">
        <Link to="/admin" className="link">
          Administrateur
        </Link>
      </footer>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
