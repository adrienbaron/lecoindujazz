import { Link } from "@remix-run/react";

import { shows, showToHumanString } from "~/models/shows";

export default function Index() {
  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4 p-2 md:p-4 lg:px-6">
      <h1 className="fluid-2xl">Billetterie Le Coin du jazz</h1>
      <div className="flex flex-col gap-2">
        <p>Bienvenue à la billetterie du Coin du jazz.</p>
        <p>Choisissez une date pour réserver vos places.</p>
      </div>
      {shows.map((show) => (
        <Link key={show.id} to={`/book/${show.id}`} className="btn-primary btn">
          {showToHumanString(show)}
        </Link>
      ))}
    </div>
  );
}
