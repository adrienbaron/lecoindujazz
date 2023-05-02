import type { AppLoadContext } from "@remix-run/cloudflare";
import { createCookieSessionStorage } from "@remix-run/cloudflare";
import type {
  Session,
  SessionData,
  SessionStorage,
} from "@remix-run/server-runtime";

let cookieSessionStorage: SessionStorage<SessionData, SessionData>;

export const getSessionStorage = <Data = SessionData, FlashData = Data>(
  context: AppLoadContext
) => {
  if (!cookieSessionStorage) {
    if (!context.SESSION_SECRET) {
      throw new Error(
        "You must provide a SESSION_SECRET environment variable to use sessions."
      );
    }

    cookieSessionStorage = createCookieSessionStorage<Data, FlashData>({
      cookie: {
        name: "__session",

        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
        path: "/",

        secrets: [context.SESSION_SECRET],
        secure: true,
      },
    });
  }

  return cookieSessionStorage;
};

export const getSetCookieHeader = async (
  context: AppLoadContext,
  session: Session
) => {
  const { commitSession } = getSessionStorage(context);
  return {
    "Set-Cookie": await commitSession(session, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
  };
};
