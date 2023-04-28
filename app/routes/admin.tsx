import type { LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

import { commitSession, getSession } from "~/session";

export const loader = async ({ context, request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  return json(
    { isAdmin: session.get("isAdmin") },
    {
      headers: {
        "Set-Cookie": await commitSession(session, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
      },
    }
  );
};

export default function Admin() {
  const { isAdmin } = useLoaderData<typeof loader>();

  if (!isAdmin) {
    return (
      <section className="flex justify-center p-4">
        <Form
          method="post"
          className="card w-full max-w-lg rounded bg-base-200"
        >
          <div className="card-body">
            <label className="label" htmlFor="passwordField">
              Mot de passe:
            </label>
            <input id="passwordField" type="password" className="input" />
            <div className="card-actions flex justify-end">
              <button className="btn-primary btn">Se connecter</button>
            </div>
          </div>
        </Form>
      </section>
    );
  }
}
