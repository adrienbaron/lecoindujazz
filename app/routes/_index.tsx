import { Link, useRouteLoaderData, useSearchParams } from "@remix-run/react";

import { SuccessIcon } from "~/components/icons";
import { shows, showToHumanString } from "~/models/shows";

export default function Index() {
  const { isBookingOpen, isAdmin } = useRouteLoaderData("root") as {
    isAdmin: boolean;
    isBookingOpen: boolean;
  };
  const [searchParams] = useSearchParams();

  const canSeeShows = isBookingOpen || isAdmin;

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4 p-2 md:p-4 lg:px-6">
      {searchParams.get("success") === "true" && (
        <div className="alert alert-success shadow-lg">
          <div>
            <SuccessIcon />
            <span>
              Merci de votre achat! Vous recevrez un email de confirmation dans
              quelques minutes.
            </span>
          </div>
        </div>
      )}
      <h1 className="fluid-2xl">Billetterie Le Coin du jazz</h1>
      <div className="flex flex-col gap-2">
        <p>Bienvenue à la billetterie du Coin du jazz.</p>
        {isBookingOpen && !isAdmin && (
          <p>Choisissez une date pour réserver vos places.</p>
        )}
        {isAdmin && <p>Choississez une date à administrer</p>}
        {!canSeeShows && <p>La billeterie ouvre bientôt!</p>}
      </div>
      {canSeeShows &&
        shows.map((show) => (
          <Link
            key={show.id}
            to={`/book/${show.id}`}
            className="btn-primary btn"
          >
            {showToHumanString(show)}
          </Link>
        ))}
    </div>
  );
}
