import { Link } from "@remix-run/react";

const performances = [
  {
    id: "MOCK_SHOW_ID",
    title: "Demo show",
    date: new Date("2021-09-01"),
  },
];

export default function Index() {
  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-4">
      <h1 className="fluid-2xl">Billetterie Le Coin du jazz</h1>
      <div className="flex flex-col gap-2">
        <p>Bienvenue à la billetterie du Coin du jazz.</p>
        <p>Choisissez une date pour réserver vos places.</p>
      </div>
      {performances.map((performance) => (
        <Link
          key={performance.id}
          to={`/book/${performance.id}`}
          className="btn-primary btn"
        >
          {performance.title} - {performance.date.toLocaleDateString("fr-FR")}
        </Link>
      ))}
    </div>
  );
}
