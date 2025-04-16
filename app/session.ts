import type { AppLoadContext } from "react-router";
import { createCookieSessionStorage } from "react-router";
import type { Session, SessionData, SessionStorage } from "react-router";

let cookieSessionStorage: SessionStorage<SessionData, SessionData>;

export const getSessionStorage = <Data = SessionData, FlashData = Data>(
  context: AppLoadContext,
) => {
  if (!cookieSessionStorage) {
    const sessionSecret = context.cloudflare.env.SESSION_SECRET;
    if (!sessionSecret) {
      throw new Error(
        "You must provide a SESSION_SECRET environment variable to use sessions.",
      );
    }

    cookieSessionStorage = createCookieSessionStorage<Data, FlashData>({
      cookie: {
        name: "__session",

        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
        path: "/",

        secrets: [sessionSecret as string],
      },
    });
  }

  return cookieSessionStorage;
};

export const getSetCookieHeader = async (
  context: AppLoadContext,
  session: Session,
) => {
  const { commitSession } = getSessionStorage(context);
  return {
    "Set-Cookie": await commitSession(session, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
  };
};
