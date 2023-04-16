import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import Stripe from "stripe";

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

    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
      session.id,
      {
        expand: ["line_items"],
      }
    );
    const lineItems = session.line_items;
    console.log(
      "Checkout session completed",
      JSON.stringify(sessionWithLineItems, null, 2)
    );
  }

  return json({ success: true });
};
