import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import Stripe from "stripe";
import { z } from "zod";

import {
  getDbFromContext,
  registerPurchase,
} from "~/services/db.service.server";

const envSchema = z.object({
  STRIPE_PK: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

export const action: ActionFunction = async ({ context, request }) => {
  const parsedEnv = envSchema.safeParse(context);
  if (!parsedEnv.success) {
    return json({ error: parsedEnv.error, reason: "NO_ENV" }, { status: 500 });
  }
  const env = parsedEnv.data;

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  const stripe = new Stripe(env.STRIPE_PK, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(), // ensure we use a Fetch client, and not Node's `http`
  });

  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(err);
    return json({ error: err, reason: "STRIPE_ERROR" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.customer_details?.name || !session.customer_details?.email) {
      return json({ error: "Missing customer details" }, { status: 400 });
    }

    try {
      const db = getDbFromContext(context);
      await registerPurchase(db, session.id, {
        name: session.customer_details.name,
        email: session.customer_details.email,
      });

      console.log(`[action][${session.id}] completed purchase`);
    } catch (err) {
      console.error(err);
      return json({ error: err, reason: "DB_ERROR" }, { status: 500 });
    }
  }

  return json({ success: true });
};
