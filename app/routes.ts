import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("/admin", "routes/admin.tsx"),
  route("/basket", "routes/basket.tsx"),
  route("/book/:showId", "routes/book.$showId.tsx"),
  route("/hooks/stripe", "routes/hooks.stripe.tsx"),
] satisfies RouteConfig;
