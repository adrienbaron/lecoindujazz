import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import {
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import classNames from "classnames";
import type { PropsWithChildren } from "react";
import React from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";

import type { LockedSeatModel } from "~/models/dbSchema";
import {
  getDbFromContext,
  getLockedSeatsForSession,
} from "~/services/db.service.server";
import { getSessionStorage, getSetCookieHeader } from "~/session";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Le Coin du jazz - Billetterie",
  viewport: "width=device-width,initial-scale=1",
  "theme-color": "#202021",
});

interface LayoutProps extends PropsWithChildren {
  shouldIndex: boolean;
  isAdmin?: boolean;
  headerItems?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  isAdmin,
  shouldIndex,
  headerItems,
  children,
}) => (
  <html lang="en">
    <head>
      <Meta />
      <Links />
      {!shouldIndex && <meta name="robots" content="noindex" />}
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
          <div className="flex-none">{headerItems}</div>
        </header>
        <main>{children}</main>
      </div>
      <footer className="footer flex justify-end bg-base-200 p-8">
        <Link to="/admin" className="link">
          Administrateur
        </Link>
      </footer>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
      <script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "1334d00fe7044e12ace4e4881fb419f8"}'
      ></script>
    </body>
  </html>
);

export const loader = async ({ context, request }: LoaderArgs) => {
  const { getSession } = getSessionStorage(context);

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
      isProduction: context.IS_PRODUCTION === "true",
    },
    {
      headers: await getSetCookieHeader(context, session),
    }
  );
};

export default function App() {
  const { lockedSeatsForSession, isAdmin, isProduction } = useTypedLoaderData<{
    lockedSeatsForSession: LockedSeatModel[];
    isAdmin: boolean;
    isProduction: boolean;
  }>();

  return (
    <Layout
      isAdmin={isAdmin}
      shouldIndex={isProduction}
      headerItems={
        <>
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
        </>
      }
    >
      <Outlet />
    </Layout>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Layout shouldIndex={false}>
        <div className="flex flex-col items-center gap-2 p-2">
          {error.status === 404 ? (
            <h1 className="fluid-2xl">404 - Page non trouvée</h1>
          ) : (
            <>
              <h1 className="fluid-2xl">Houston, on a un problème</h1>
              <p>Merci de contacter le support</p>
            </>
          )}
          <div className="flex flex-col gap-4 text-center">
            <p className="fluid-lg">Votre panier est vide</p>
            <Link to={"/"} className="btn-primary btn self-center">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Layout shouldIndex={false}>
      <div className="flex flex-col items-center gap-2 p-2">
        <h1 className="fluid-2xl">Une erreur est survenue</h1>
        <p>Merci de contacter le support avec cette erreur:</p>
        <pre>{errorMessage}</pre>
        <div className="flex flex-col gap-4 text-center">
          <p className="fluid-lg">Votre panier est vide</p>
          <Link to={"/"} className="btn-primary btn self-center">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </Layout>
  );
}
