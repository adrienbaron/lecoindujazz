import { createCookieSessionStorage } from "@remix-run/cloudflare";

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
