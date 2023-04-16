import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import Stripe from "stripe";

import {
  getDbFromContext,
  registerPurchase,
} from "~/services/db.service.server";

export const action: ActionFunction = async ({ context, request }) => {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  const stripe = new Stripe(context.STRIPE_PK as string, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(), // ensure we use a Fetch client, and not Node's `http`
  });

  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      context.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error(err);
    return new Response("Webhook Error: " + err, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.customer_details?.name || !session.customer_details?.email) {
      throw new Error("No name or email found");
    }

    const db = getDbFromContext(context);
    await registerPurchase(db, session.id, {
      name: session.customer_details.name,
      email: session.customer_details.email,
    });
  }

  return json({ success: true });
};
