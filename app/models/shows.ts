interface Show {
  id: string;
  title: string;
  datetime: Date;
}

export const shows: Show[] = [
  {
    id: "2025-06-27_19-00-00",
    title: 'Spectacle Adultes "ON THE WAY"',
    datetime: new Date("2024-06-27T19:00:00.000Z"),
  },
  {
    id: "2025-06-28_12-00-00",
    title: 'Spectacle Enfants "ON THE WAY"',
    datetime: new Date("2025-06-28T12:00:00.000Z"),
  },
  {
    id: "2025-06-28_15-00-00",
    title: 'Spectacle Enfants "ON THE WAY"',
    datetime: new Date("2025-06-28T15:00:00.000Z"),
  },
  {
    id: "2025-06-28_19-00-00",
    title: 'Spectacle Adultes "ON THE WAY"',
    datetime: new Date("2025-06-28T19:00:00.000Z"),
  },
];

export const showByIdMap = new Map(shows.map((show) => [show.id, show]));

export const showToHumanString = (show: Show): string =>
  `${show.title} - ${show.datetime.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "medium",
  })} à ${show.datetime.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    timeStyle: "short",
  })}`;
