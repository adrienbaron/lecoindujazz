import { createCookieSessionStorage } from "@remix-run/cloudflare";
import type { Session } from "@remix-run/server-runtime";

export const { getSession, commitSession } = createCookieSessionStorage({
  cookie: {
    name: "__session",

    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    path: "/",

    secrets: [],
    secure: true,
  },
});

export const getSetCookieHeader = async (session: Session) => ({
  "Set-Cookie": await commitSession(session, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }),
});
