import type { ActionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useRouteLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/router";

import { getSession, getSetCookieHeader } from "~/session";

export const action = async ({ request, context }: ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const action = formData.get("action");
  if (action === "logout") {
    session.set("isAdmin", false);
    return redirect("/", { headers: await getSetCookieHeader(session) });
  }

  const password = formData.get("password");
  if (!password) {
    return json({ error: "Mot de passe invalide" }, { status: 400 });
  }
  if (password !== context.ADMIN_PASSWORD) {
    return json({ error: "Mot de passe invalide" }, { status: 400 });
  }

  session.set("isAdmin", true);
  return redirect("/", {
    headers: await getSetCookieHeader(session),
  });
};

export default function Admin() {
  const { isAdmin } = useRouteLoaderData("root") as { isAdmin: boolean };

  if (!isAdmin) {
    return (
      <section className="flex justify-center p-4">
        <Form
          method="POST"
          className="card w-full max-w-lg rounded bg-base-200"
        >
          <div className="card-body">
            <label className="label" htmlFor="passwordField">
              Mot de passe:
            </label>
            <input
              id="passwordField"
              name="password"
              type="password"
              className="input"
            />
            <div className="card-actions flex justify-end">
              <button className="btn-primary btn" name="action" value="login">
                Se connecter
              </button>
            </div>
          </div>
        </Form>
      </section>
    );
  }

  return (
    <section className="flex justify-center p-4">
      <Form method="POST" className="card w-full max-w-lg rounded bg-base-200">
        <div className="card-body">
          <p>Vous êtes connecté en tant qu&rsquo;administrateur</p>
          <div className="card-actions flex justify-end">
            <button className="btn-primary btn" name="action" value="logout">
              Se deconnecter
            </button>
          </div>
        </div>
      </Form>
    </section>
  );
}
